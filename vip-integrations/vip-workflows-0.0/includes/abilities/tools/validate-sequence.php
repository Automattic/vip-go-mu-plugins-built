<?php
/**
 * Validate Sequence ability.
 *
 * Read-only dry run of the sequence write gate. Answers "is this config valid, and
 * what would it become" without persisting anything — the question nothing could ask
 * before, because normalization is write-time only.
 *
 * Validation is not reimplemented here. A write passes two gates and this calls
 * both: SequencesController's checks on metadata fields, stage agents and
 * assignment wiring — which create_item(), update_item() and import_sequence()
 * all run, for every sequence type — and then Sequence::prepare_config_for_write(),
 * a pure function (static, no database access, returns the normalized config,
 * throws on a malformed graph). Anything this reports valid is what the repository
 * would accept, by construction.
 *
 * Only the first rule a config breaks is reported, because that is what a write
 * reports. The three controller checks run in create_item()'s order; import
 * happens to ask in another, so a config breaking two of them can be named by a
 * different one of the two depending on which path is asked.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

use VIPWorkflows\API\SequencesController;
use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Sequences\SequenceRepository;

const VALIDATE_SEQUENCE_ABILITY_ID = 'vip-workflows/validate-sequence';

/**
 * Execute the sequence validation dry run.
 *
 * @since 0.0.1
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_validate_sequence( ?array $input = null ) {
	$input       = $input ?? array();
	$sequence_id = isset( $input['sequence_id'] ) ? (int) $input['sequence_id'] : 0;
	$config      = $input['config'] ?? null;

	// Exactly one source. Accepting both would leave it ambiguous which one was
	// actually validated, and accepting neither has nothing to validate.
	if ( $sequence_id > 0 && null !== $config ) {
		return new \WP_Error(
			'ambiguous_input',
			__( 'Pass either "sequence_id" or "config", not both.', 'vip-workflows' )
		);
	}

	if ( 0 === $sequence_id && null === $config ) {
		return new \WP_Error(
			'missing_input',
			__( 'One of "sequence_id" or "config" is required.', 'vip-workflows' )
		);
	}

	if ( $sequence_id > 0 ) {
		$sequence = ( new SequenceRepository() )->find( $sequence_id );

		if ( ! $sequence ) {
			return new \WP_Error(
				'sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' )
			);
		}

		$config    = $sequence->config;
		$type      = $sequence->type;
		$source_id = $sequence->id;
	} else {
		if ( ! is_array( $config ) ) {
			return new \WP_Error(
				'invalid_config',
				__( 'The "config" parameter must be an object.', 'vip-workflows' )
			);
		}

		$type      = isset( $input['type'] ) ? (string) $input['type'] : Sequence::TYPE_WORKFLOW;
		$source_id = null;
	}

	// The controller gate, which create_item()/update_item()/import_sequence()
	// run for EVERY sequence type — so it runs here before the phase branch
	// below, which is exempt from the stage rules and from nothing else. Each
	// check is its own statement rather than an entry in one array, because an
	// array literal evaluates every call before anything can look at the first
	// answer: this stops at the rule the config actually breaks, the way a write
	// does.
	//
	// A phase sequence stores its graph under `phases` and hands it to the write
	// path through the same `statuses` REST field, so the gate sees one array
	// whichever type it is given — and so does this.
	$controller = new SequencesController();
	$graph      = $config['statuses'] ?? $config['phases'] ?? null;
	$statuses   = is_array( $graph ) ? $graph : array();
	$errors     = array();

	// A file exported by an older version declares what a transition captures as a
	// singular `input`. Converted first, exactly as import_sequence() converts it,
	// because validate_assignment_keys() below reads `inputs` and nothing else: on
	// the old shape it would see no assignment slots at all, and then report a
	// `requires_assignment` gate as pointing at a slot nobody declares — or pass a
	// file whose two transitions assign the same key, which the import it is
	// predicting would refuse. This ability promises that anything it calls valid
	// is what the repository would accept; that promise is what makes the
	// conversion belong here too.
	try {
		$statuses = Sequence::normalize_input_shape( array( 'statuses' => $statuses ) )['statuses'];
	} catch ( \InvalidArgumentException $e ) {
		$errors[] = $e->getMessage();
	}

	$metadata_check = $controller->validate_metadata_fields( $config['metadata_fields'] ?? array() );
	if ( is_wp_error( $metadata_check ) ) {
		$errors[] = $metadata_check->get_error_message();
	}

	if ( empty( $errors ) ) {
		$agent_check = $controller->validate_status_agents( $statuses );
		if ( is_wp_error( $agent_check ) ) {
			$errors[] = $agent_check->get_error_message();
		}
	}

	if ( empty( $errors ) ) {
		$assignment_check = $controller->validate_assignment_keys( $statuses );
		if ( is_wp_error( $assignment_check ) ) {
			$errors[] = $assignment_check->get_error_message();
		}
	}

	// Phase sequences carry a `phases` graph rather than stages with regions, and the
	// gate exempts them from every stage rule. Say so instead of reporting a
	// vacuous pass.
	if ( Sequence::TYPE_PHASE === $type ) {
		return array(
			'sequence_id'           => $source_id,
			'type'                  => $type,
			'valid'                 => empty( $errors ),
			'errors'                => $errors,
			'normalization'         => array(),
			'stages_missing_region' => array(),
			'regions_missing_entry' => array(),
			'normalized_config'     => $config,
			'notes'                 => array(
				__( 'Phase sequences are exempt from the stage graph rules; the write gate normalizes nothing for them.', 'vip-workflows' ),
			),
		);
	}

	// Both stage x status invariants, read without tripping them. The throwing read
	// path (get_stage_status / get_region_entry_stage) is unusable for reporting: it
	// fatals on exactly the configs a validator exists to describe.
	$stages_missing_region = Sequence::find_stages_missing_region( $statuses );
	$regions_missing_entry = Sequence::find_regions_missing_entry( $statuses );

	$normalized_config = null;

	// Only worth asking what the write gate would normalize once the config has
	// something to normalize: a write that fails the controller gate never reaches it.
	if ( empty( $errors ) ) {
		try {
			$normalized_config = Sequence::prepare_config_for_write( $config, $type );
		} catch ( \InvalidArgumentException $e ) {
			// The gate reports the first rule a config breaks, not every rule. That is
			// the gate's contract, and reproducing the rules here to collect them all
			// would be the duplicate validator this ability exists to avoid.
			$errors[] = $e->getMessage();
		}
	}

	return array(
		'sequence_id'           => $source_id,
		'type'                  => $type,
		'valid'                 => empty( $errors ),
		'errors'                => $errors,
		'normalization'         => null === $normalized_config
			? array()
			: describe_sequence_normalization( $statuses, $normalized_config['statuses'] ?? array() ),
		'stages_missing_region' => $stages_missing_region,
		'regions_missing_entry' => $regions_missing_entry,
		'normalized_config'     => $normalized_config,
		'notes'                 => array(),
	);
}

/**
 * Describe, in human terms, what the write gate changed about a stage list.
 *
 * The gate normalizes silently: an absent region becomes `draft`, an unmarked region
 * gains a checkpoint on its first stage, keys and transition targets get
 * sanitize_key'd. A dry run that reported only pass/fail would hide all of it — and
 * the auto-assigned checkpoint in particular is how a config with regions but no
 * checkpoint passes validation, so it has to be visible rather than inferred.
 *
 * @since 0.0.1
 *
 * @param  array $before Stage list as supplied.
 * @param  array $after  Stage list as the gate normalized it.
 * @return string[] Human-readable descriptions of each change, empty when none.
 */
function describe_sequence_normalization( array $before, array $after ): array {
	$changes = array();
	$before  = array_values( $before );

	foreach ( array_values( $after ) as $index => $stage ) {
		$original = is_array( $before[ $index ] ?? null ) ? $before[ $index ] : array();
		$key      = (string) ( $stage['key'] ?? '' );

		$original_key = (string) ( $original['key'] ?? '' );
		if ( '' !== $original_key && $original_key !== $key ) {
			$changes[] = sprintf(
				/* translators: 1: stage key as supplied, 2: normalized stage key. */
				__( 'Stage key "%1$s" is normalized to "%2$s".', 'vip-workflows' ),
				$original_key,
				$key
			);
		}

		$original_region = $original['status'] ?? null;
		if ( null === $original_region || '' === $original_region ) {
			$changes[] = sprintf(
				/* translators: 1: stage key, 2: status region the stage is assigned to. */
				__( 'Stage "%1$s" has no status region and is assigned to "%2$s".', 'vip-workflows' ),
				$key,
				(string) ( $stage['status'] ?? '' )
			);
		}

		if ( ! empty( $stage['region_entry'] ) && empty( $original['region_entry'] ) ) {
			$changes[] = sprintf(
				/* translators: 1: status region, 2: stage key made the region entry checkpoint. */
				__( 'Region "%1$s" designates no entry checkpoint, so stage "%2$s" becomes its entry.', 'vip-workflows' ),
				(string) ( $stage['status'] ?? '' ),
				$key
			);
		}
	}

	return $changes;
}

/**
 * Register the Validate Sequence ability.
 *
 * @since 0.0.1
 *
 * @return void
 */
function register_validate_sequence(): void {
	vip_workflows_register_ability(
		VALIDATE_SEQUENCE_ABILITY_ID,
		array(
			'label'               => __( 'Validate Sequence', 'vip-workflows' ),
			'description'         => __( 'Dry-runs a sequence configuration through the write gate without saving it. Reports whether it is valid, what normalization would change, and which stage/region invariants it breaks. Pass "sequence_id" to inspect a stored sequence, or "config" to check a proposed one.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'sequence_id' => array(
						'type'        => 'integer',
						'description' => __( 'Validate the stored configuration of this sequence. Mutually exclusive with "config".', 'vip-workflows' ),
					),
					'config'      => array(
						'type'        => 'object',
						'description' => __( 'Validate a proposed sequence configuration (a "statuses" array, plus any other config keys). Mutually exclusive with "sequence_id".', 'vip-workflows' ),
					),
					'type'        => array(
						'type'        => 'string',
						'description' => __( 'Sequence type the proposed config is for. Only meaningful with "config"; a stored sequence uses its own type. Defaults to "workflow".', 'vip-workflows' ),
						'enum'        => array( Sequence::TYPE_WORKFLOW, Sequence::TYPE_PHASE ),
						'default'     => Sequence::TYPE_WORKFLOW,
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'sequence_id'           => array(
						'type'        => array( 'integer', 'null' ),
						'description' => __( 'The validated sequence ID, or null when a proposed config was validated.', 'vip-workflows' ),
					),
					'type'                  => array(
						'type'        => 'string',
						'description' => __( 'The sequence type the config was validated as.', 'vip-workflows' ),
					),
					'valid'                 => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the write gate would accept this configuration.', 'vip-workflows' ),
					),
					'errors'                => array(
						'type'        => 'array',
						'description' => __( 'Why the configuration was rejected. The gate reports the first rule broken, so fixing one error may reveal another.', 'vip-workflows' ),
						'items'       => array( 'type' => 'string' ),
					),
					'normalization'         => array(
						'type'        => 'array',
						'description' => __( 'What the write gate would silently change (defaulted status regions, auto-assigned region entry checkpoints, normalized keys).', 'vip-workflows' ),
						'items'       => array( 'type' => 'string' ),
					),
					'stages_missing_region' => array(
						'type'        => 'array',
						'description' => __( 'Stage keys carrying no status region. Every read of such a stage throws until it is repaired.', 'vip-workflows' ),
						'items'       => array( 'type' => 'string' ),
					),
					'regions_missing_entry' => array(
						'type'        => 'array',
						'description' => __( 'Status regions that hold stages but designate no entry checkpoint. Every core-driven reseat into such a region throws until it is repaired.', 'vip-workflows' ),
						'items'       => array( 'type' => 'string' ),
					),
					'normalized_config'     => array(
						'type'        => array( 'object', 'null' ),
						'description' => __( 'The configuration as it would be persisted, or null when it was rejected.', 'vip-workflows' ),
					),
					'notes'                 => array(
						'type'        => 'array',
						'description' => __( 'Advisories about the scope of the check itself.', 'vip-workflows' ),
						'items'       => array( 'type' => 'string' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_validate_sequence',
			// Same bar as update: the output carries the full stored configuration,
			// including role permissions and required tools.
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'meta'                => array(
				'show_in_commands'    => false,
				'transition_eligible' => false,
				'annotations'         => array(
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				),
				'mcp'                 => array(
					'public' => true,
					'type'   => 'tool',
				),
			),
		)
	);
}
