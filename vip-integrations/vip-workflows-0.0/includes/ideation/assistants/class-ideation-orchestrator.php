<?php
/**
 * Ideation Orchestrator.
 *
 * Coordinates running research agents against an ideation seed.
 * The Seed Analyst runs first, then research abilities (discovered
 * from WP Core's Abilities Registry) run with its output as context.
 * Results are stored as project meta + ideation_sources.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\Abilities\Ability;
use VIPWorkflows\Abilities\AbilityResult;
use VIPWorkflows\Abilities\AbilityResultRepository;
use VIPWorkflows\Abilities\AbilitySettings;
use VIPWorkflows\API\AvailabilitySerializer;
use VIPWorkflows\Ideation\Research\IdeationPostTypes;
use VIPWorkflows\Integrations\GuidelineContextProvider;
use VIPWorkflows\Story\Story;

/**
 * Ideation Orchestrator.
 */
class IdeationOrchestrator {

	private const META_ASSISTANT_PREFIX = '_vip_ideation_asst_';
	private const META_SEED_ANALYSIS   = '_vip_ideation_seed_analysis';
	private const META_BOARD_CARDS   = '_vip_ideation_board_cards';
	private const META_PINNED        = '_vip_ideation_pinned_cards';
	private const META_DISMISSED     = '_vip_ideation_dismissed_cards';
	private const META_QUERY_LOG     = '_vip_ideation_query_log';

	private const BOARD_CARD_TYPES = array( 'tag-cloud', 'entity', 'news-angle' );

	/**
	 * Prefix every minted board-card id carries.
	 *
	 * Board cards live in project meta and are re-minted from scratch on every
	 * analysis, so their ids have to be distinguishable from the source ids that
	 * live in the `vip_ideation_sources` table — the two share one pinned list.
	 * Source ids are a truncated sha1, so they are hex only and none can carry
	 * this prefix.
	 */
	private const BOARD_CARD_ID_PREFIX = 'board-';

	private const CACHE_TTL = 3600;

	/**
	 * Get research abilities from Core's registry, sorted by display_order.
	 *
	 * Only returns Ability instances (our subclass) since research agents
	 * are registered via vip_workflows_register_ability().
	 *
	 * @return Ability[]
	 */
	public function get_research_abilities(): array {
		$all      = wp_get_abilities();
		$settings = AbilitySettings::get_instance();

		$research = array_filter(
			$all,
			fn( $ability ) => $ability instanceof Ability
				&& ( $ability->get_meta()['type'] ?? '' ) === 'research'
				&& $settings->is_enabled( $ability->get_name() )
		);

		usort( $research, fn( Ability $a, Ability $b ) => $a->get_display_order() <=> $b->get_display_order() );

		return $research;
	}

	/**
	 * Get queryable assistant IDs (for REST validation).
	 *
	 * @return string[]
	 */
	public function get_queryable_assistants(): array {
		return array_map(
			fn( $ability ) => $ability->get_name(),
			$this->get_research_abilities()
		);
	}

	/**
	 * Create an ideation project from a seed.
	 *
	 * Only runs the Seed Analyst (fast). Research abilities are set
	 * to 'pending' and kicked off by the frontend in parallel.
	 *
	 * @param  string $seed    The raw seed text.
	 * @param  int    $user_id The creating user's ID.
	 * @return int|\WP_Error Project post ID or error.
	 */
	public function create_from_seed( string $seed, int $user_id ): int|\WP_Error {
		$project_id = wp_insert_post(
			array(
				'post_type'    => IdeationPostTypes::POST_TYPE,
				'post_status'  => 'active',
				'post_author'  => $user_id,
				'post_title'   => mb_substr( $seed, 0, 100 ),
				'post_content' => '',
				'meta_input'   => array(
					'_vip_ideation_seed' => $seed,
					self::META_PINNED    => wp_json_encode( array() ),
					self::META_DISMISSED => wp_json_encode( array() ),
				),
			),
			true
		);

		if ( is_wp_error( $project_id ) ) {
			return $project_id;
		}

		$story = Story::create( mb_substr( $seed, 0, 100 ), Story::STATUS_IDEATION );
		if ( ! is_wp_error( $story ) ) {
			$story->add_object( $project_id, 'ideation' );
		}

		$this->run_seed_analyst( $project_id, $seed );

		// Research does not depend on the analysis having succeeded — the agents
		// take the seed as well — so they are queued either way.
		$this->reset_research_assistants( $project_id );

		return $project_id;
	}

	/**
	 * Re-run the Seed Analyst for an existing project, replacing its analysis.
	 *
	 * A project created while the AI provider was misconfigured keeps that stored
	 * result for as long as it exists, so this is how an editor recovers one. It is
	 * a full restart and not a repair: a completed run replaces the seed analysis
	 * and the whole board, and puts every research agent back to `pending` for the
	 * frontend to fire. Board-card pins cannot survive it, because board card ids
	 * are minted per run.
	 *
	 * A run that does not complete replaces nothing — see run_seed_analyst().
	 *
	 * @since 0.0.1
	 *
	 * @param  int $project_id Research project post ID.
	 * @return array|\WP_Error The analyst result, or an error when the project
	 *                         carries no seed to analyze.
	 */
	public function restart_analysis( int $project_id ): array|\WP_Error {
		$seed = get_post_meta( $project_id, '_vip_ideation_seed', true );

		if ( ! is_string( $seed ) || '' === trim( $seed ) ) {
			// The seed is required at creation, so its absence is a data integrity
			// problem and not a state to work around.
			return new \WP_Error(
				'missing_seed',
				__( 'This project has no seed text to analyze.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$result = $this->run_seed_analyst( $project_id, $seed );

		if ( 'completed' === ( $result['status'] ?? '' ) ) {
			$this->reset_research_assistants( $project_id );
		}

		return $result;
	}

	/**
	 * Run the Seed Analyst and commit its result when it completed.
	 *
	 * The analyst's own status and stored result always reflect the run, including
	 * a failure — that is the record of what happened. Everything the analysis
	 * *produces* is committed only when the run completed, so a run that failed or
	 * found its provider unconfigured leaves the seed analysis and the board as
	 * they were. On a first analysis they were never written, and every reader
	 * already treats an absent value as empty; on a re-run they hold the previous
	 * analysis, which is the whole point of not touching them.
	 *
	 * @param  int    $project_id Research project post ID.
	 * @param  string $seed       The seed text.
	 * @return array The analyst result { status, cards, summary, meta, ... }.
	 */
	private function run_seed_analyst( int $project_id, string $seed ): array {
		$seed_analyst = new SeedAnalyst();

		$context = array(
			'project_id'    => $project_id,
			'seed'          => $seed,
			'seed_analysis' => array(),
			'brand_context' => $this->get_brand_context( $seed ),
		);

		$this->set_assistant_status( $project_id, $seed_analyst->get_id(), 'running' );
		$result = $seed_analyst->run( $context );
		$status = $result['status'] ?? 'failed';
		$this->set_assistant_status( $project_id, $seed_analyst->get_id(), $status );

		if ( 'completed' === $status ) {
			$this->commit_seed_analysis( $project_id, $result );
		}

		$this->update_assistant_meta( $project_id, $seed_analyst->get_id(), $result );

		return $result;
	}

	/**
	 * Store what a completed analysis produced.
	 *
	 * @since 0.0.1
	 *
	 * @param int   $project_id Research project post ID.
	 * @param array $result     A completed Seed Analyst result.
	 */
	private function commit_seed_analysis( int $project_id, array $result ): void {
		$seed_analysis = $result['meta'] ?? array();
		update_post_meta( $project_id, self::META_SEED_ANALYSIS, wp_json_encode( $seed_analysis ) );

		$board_cards = array();
		foreach ( $result['cards'] ?? array() as $card ) {
			if ( in_array( $card['type'] ?? '', self::BOARD_CARD_TYPES, true ) ) {
				$card['card_id'] = self::BOARD_CARD_ID_PREFIX . wp_generate_password( 8, false );
				$board_cards[]   = $card;
			}
		}
		update_post_meta( $project_id, self::META_BOARD_CARDS, wp_json_encode( $board_cards ) );

		$suggested_title = $seed_analysis['suggested_title'] ?? '';
		if ( ! empty( $suggested_title ) ) {
			update_post_meta( $project_id, '_vip_ideation_suggested_title', sanitize_text_field( $suggested_title ) );
		}

		$this->reconcile_board_card_selections( $project_id, $board_cards );
	}

	/**
	 * Drop pins and dismissals that named board cards the new board no longer has.
	 *
	 * Pinned and dismissed ids are one list each, mixing two populations that are
	 * stored in different places. Source ids belong to rows in
	 * `vip_ideation_sources`, which an analysis never touches, so they are left
	 * exactly as they are. Board-card ids belong to project meta that has just been
	 * rewritten, and a re-analysis mints fresh ones, so any that the new board does
	 * not carry would otherwise sit in the list forever pointing at nothing.
	 *
	 * @since 0.0.1
	 *
	 * @param int   $project_id  Research project post ID.
	 * @param array $board_cards The board cards just committed.
	 */
	private function reconcile_board_card_selections( int $project_id, array $board_cards ): void {
		$live_ids = array();
		foreach ( $board_cards as $card ) {
			$live_ids[] = (string) ( $card['card_id'] ?? $card['type'] ?? '' );
		}

		foreach ( array( self::META_PINNED, self::META_DISMISSED ) as $meta_key ) {
			$stored = get_post_meta( $project_id, $meta_key, true );
			$stored = json_decode( $stored ? $stored : '[]', true );

			$kept = array_values(
				array_filter(
					$stored,
					fn( $id ) => ! self::is_board_card_id( (string) $id )
						|| in_array( (string) $id, $live_ids, true )
				)
			);

			if ( $kept !== $stored ) {
				update_post_meta( $project_id, $meta_key, wp_json_encode( $kept ) );
			}
		}
	}

	/**
	 * Whether a selected card id names a board card rather than a stored source.
	 *
	 * Minted board ids carry `BOARD_CARD_ID_PREFIX`. Board cards written before
	 * that prefix existed had no id of their own and were selected by card type —
	 * `get_state()` still resolves them that way — so those count too. Source ids
	 * are bare alphanumerics and can be neither.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $card_id A pinned or dismissed id.
	 * @return bool
	 */
	private static function is_board_card_id( string $card_id ): bool {
		return str_starts_with( $card_id, self::BOARD_CARD_ID_PREFIX )
			|| in_array( $card_id, self::BOARD_CARD_TYPES, true );
	}

	/**
	 * Put every research agent back to `pending` for the frontend to fire.
	 *
	 * @since 0.0.1
	 *
	 * @param int $project_id Research project post ID.
	 */
	private function reset_research_assistants( int $project_id ): void {
		foreach ( $this->get_research_abilities() as $ability ) {
			$ability_id = $ability->get_name();
			$this->update_assistant_meta(
				$project_id,
				$ability_id,
				array(
					'status'  => 'pending',
					'cards'   => array(),
					'summary' => '',
				)
			);
			$this->set_assistant_status( $project_id, $ability_id, 'pending' );
		}
	}

	/**
	 * Run a single research ability for its initial pass.
	 *
	 * @param  int    $project_id   Research project post ID.
	 * @param  string $assistant_id Which research ability to run.
	 * @return array Result array { status, cards, summary, ... }
	 */
	public function run_initial_assistant( int $project_id, string $assistant_id ): array {
		return $this->run_single_assistant( $project_id, $assistant_id );
	}

	/**
	 * Run a follow-up query against a single research ability.
	 *
	 * @param  int    $project_id   Research project post ID.
	 * @param  string $assistant_id Which research ability to run.
	 * @param  string $query        The custom search query.
	 * @return array Result array.
	 */
	public function run_query( int $project_id, string $assistant_id, string $query ): array {
		$result = $this->run_single_assistant( $project_id, $assistant_id, $query );
		$this->log_query( $project_id, $query, $assistant_id, $result );
		return $result;
	}

	/**
	 * Core logic for running a single research ability.
	 *
	 * Calls the ability's execute callback directly (not through AbilityExecutor)
	 * to control the split storage: cards go to ideation_sources, lightweight
	 * metadata goes to ability_results.
	 *
	 * @param  int         $project_id   Research project post ID.
	 * @param  string      $assistant_id Which research ability to run.
	 * @param  string|null $query        Optional custom search query.
	 * @return array Result array.
	 */
	private function run_single_assistant( int $project_id, string $assistant_id, ?string $query = null ): array {
		$ability = wp_get_ability( $assistant_id );

		if ( ! $ability ) {
			return array(
				'status' => 'failed',
				'error' => __( 'Unknown research agent.', 'vip-workflows' ),
			);
		}

		if ( $ability instanceof Ability ) {
			$availability = $ability->get_availability();

			if ( ! $availability->is_available() ) {
				/*
				 * `error` stays the generic, register-neutral line: this array is
				 * persisted as project meta, which outlives the run and has no
				 * reader at write time. Which requirement is unmet travels as
				 * structured identity, and both message registers are derived from
				 * the ability's live availability in add_reader_availability().
				 * An agent whose callback returned a bare `false` has no
				 * requirements, and the generic line is all there is to say.
				 */
				$result = array(
					'status'       => 'unavailable',
					'error'        => __( 'Research agent is not configured.', 'vip-workflows' ),
					'requirements' => AvailabilitySerializer::to_persistable( $availability ),
				);
				$this->set_assistant_status( $project_id, $assistant_id, 'unavailable' );
				$this->update_assistant_meta( $project_id, $assistant_id, $result );
				return $result;
			}
		}

		$seed          = get_post_meta( $project_id, '_vip_ideation_seed', true );
		$seed_analysis = get_post_meta( $project_id, self::META_SEED_ANALYSIS, true );
		$seed_analysis = json_decode( $seed_analysis ? $seed_analysis : '{}', true );

		$this->set_assistant_status( $project_id, $assistant_id, 'running' );

		$cache_key = 'vip_ideation_' . $assistant_id . '_' . md5( $seed . ( $query ?? '' ) );
		$cached    = get_transient( $cache_key );

		if ( false !== $cached && is_array( $cached ) ) {
			$raw_output  = $cached;
			$duration_ms = 0;
		} else {
			$input = array(
				'project_id'    => $project_id,
				'seed'          => $seed,
				'seed_analysis' => $seed_analysis,
			);

			if ( null !== $query ) {
				$input['query'] = $query;
			}

			$start      = microtime( true );
			$raw_output = $ability->execute( $input );
			$duration_ms = (int) ( ( microtime( true ) - $start ) * 1000 );

			if ( is_wp_error( $raw_output ) ) {
				$result = array(
					'status' => 'failed',
					'error' => $raw_output->get_error_message(),
				);
				$this->set_assistant_status( $project_id, $assistant_id, 'failed' );
				$this->update_assistant_meta( $project_id, $assistant_id, $result );
				return $result;
			}

			if ( ! empty( $raw_output['cards'] ) ) {
				set_transient( $cache_key, $raw_output, self::CACHE_TTL );
			}
		}

		$cards   = $raw_output['cards'] ?? array();
		$summary = $raw_output['summary'] ?? '';

		if ( ! empty( $cards ) ) {
			$this->store_cards_as_sources( $project_id, $cards, get_current_user_id(), $assistant_id );
		}

		$ability_result              = AbilityResult::success(
			$assistant_id,
			array(
				'card_count' => count( $cards ),
				'summary'    => $summary,
			)
		);
		$ability_result->summary     = $summary;
		$ability_result->post_id     = $project_id;
		$ability_result->duration_ms = $duration_ms;

		$repository = new AbilityResultRepository();
		$repository->save( $ability_result );

		$this->set_assistant_status( $project_id, $assistant_id, 'completed' );

		$result = array(
			'status'     => 'completed',
			'cards'      => $cards,
			'summary'    => $summary,
			'card_count' => count( $cards ),
		);

		$this->update_assistant_meta( $project_id, $assistant_id, $result );

		return $result;
	}

	/**
	 * Run the Editorial Mentor evaluation.
	 *
	 * @param  int $project_id Research project post ID.
	 * @return array Mentor result.
	 */
	public function run_mentor( int $project_id ): array {
		$seed          = get_post_meta( $project_id, '_vip_ideation_seed', true );
		$seed_analysis = get_post_meta( $project_id, self::META_SEED_ANALYSIS, true );
		$seed_analysis = json_decode( $seed_analysis ? $seed_analysis : '{}', true );
		$pinned_ids    = get_post_meta( $project_id, self::META_PINNED, true );
		$pinned_ids    = json_decode( $pinned_ids ? $pinned_ids : '[]', true );
		$dismissed_ids = get_post_meta( $project_id, self::META_DISMISSED, true );
		$dismissed_ids = json_decode( $dismissed_ids ? $dismissed_ids : '[]', true );

		$pinned_cards = $this->get_cards_by_ids( $project_id, $pinned_ids );
		$total_cards  = $this->count_project_cards( $project_id );

		$mentor = new EditorialMentor();

		return $mentor->run(
			array(
				'project_id'      => $project_id,
				'seed'            => $seed,
				'seed_analysis'   => $seed_analysis,
				'pinned_cards'    => $pinned_cards,
				'dismissed_count' => count( $dismissed_ids ),
				'total_cards'     => $total_cards,
				'brand_context'   => array(),
			)
		);
	}

	/**
	 * Generate an AI image for a project.
	 *
	 * @param  int    $project_id Research project post ID.
	 * @param  string $prompt     Image generation prompt.
	 * @return array|\WP_Error The new image card data or error.
	 */
	public function generate_image( int $project_id, string $prompt ): array|\WP_Error {
		$seed_analysis = get_post_meta( $project_id, self::META_SEED_ANALYSIS, true );
		$seed_analysis = json_decode( $seed_analysis ? $seed_analysis : '{}', true );

		$result = MediaScout::generate_media( $prompt, array( 'seed_analysis' => $seed_analysis ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$cards = $result['cards'] ?? array();
		if ( empty( $cards ) ) {
			return new \WP_Error(
				'generation_failed',
				__( 'Image generation failed.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$this->store_cards_as_sources( $project_id, $cards, get_current_user_id(), 'vip-workflows/media-scout' );

		$all_cards = $this->get_all_cards( $project_id );
		$last      = end( $all_cards );

		return $last ? $last : new \WP_Error( 'store_failed', __( 'Failed to store generated image.', 'vip-workflows' ) );
	}

	// ─── Card Management ─────────────────────────────────────────

	/**
	 * Pin a card (source) in the ideation workspace.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $source_id Source ID.
	 */
	public function pin_card( int $project_id, string $source_id ): void {
		$pinned = get_post_meta( $project_id, self::META_PINNED, true );
		$pinned = json_decode( $pinned ? $pinned : '[]', true );
		if ( ! in_array( $source_id, $pinned, true ) ) {
			$pinned[] = $source_id;
			update_post_meta( $project_id, self::META_PINNED, wp_json_encode( $pinned ) );
		}
		$this->restore_card( $project_id, $source_id );
	}

	/**
	 * Dismiss a card from the workspace.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $source_id Source ID.
	 */
	public function dismiss_card( int $project_id, string $source_id ): void {
		$dismissed = get_post_meta( $project_id, self::META_DISMISSED, true );
		$dismissed = json_decode( $dismissed ? $dismissed : '[]', true );
		if ( ! in_array( $source_id, $dismissed, true ) ) {
			$dismissed[] = $source_id;
			update_post_meta( $project_id, self::META_DISMISSED, wp_json_encode( $dismissed ) );
		}
		$this->unpin_card( $project_id, $source_id );
	}

	/**
	 * Unpin a card.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $source_id Source ID.
	 */
	public function unpin_card( int $project_id, string $source_id ): void {
		$pinned = get_post_meta( $project_id, self::META_PINNED, true );
		$pinned = json_decode( $pinned ? $pinned : '[]', true );
		$pinned = array_values( array_filter( $pinned, fn( $id ) => $source_id !== $id ) );
		update_post_meta( $project_id, self::META_PINNED, wp_json_encode( $pinned ) );
	}

	/**
	 * Restore a dismissed card.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $source_id Source ID.
	 */
	public function restore_card( int $project_id, string $source_id ): void {
		$dismissed = get_post_meta( $project_id, self::META_DISMISSED, true );
		$dismissed = json_decode( $dismissed ? $dismissed : '[]', true );
		$dismissed = array_values( array_filter( $dismissed, fn( $id ) => $source_id !== $id ) );
		update_post_meta( $project_id, self::META_DISMISSED, wp_json_encode( $dismissed ) );
	}

	// ─── State ───────────────────────────────────────────────────

	/**
	 * Get the full ideation state for a project.
	 *
	 * @param int $project_id Ideation project post ID.
	 */
	public function get_state( int $project_id ): array {
		$project       = get_post( $project_id );
		$seed          = get_post_meta( $project_id, '_vip_ideation_seed', true );
		$seed_analysis = get_post_meta( $project_id, self::META_SEED_ANALYSIS, true );
		$seed_analysis = json_decode( $seed_analysis ? $seed_analysis : '{}', true );
		$assistants    = $this->get_all_assistant_meta( $project_id );
		$pinned_ids    = get_post_meta( $project_id, self::META_PINNED, true );
		$pinned_ids    = json_decode( $pinned_ids ? $pinned_ids : '[]', true );
		$dismissed_ids = get_post_meta( $project_id, self::META_DISMISSED, true );
		$dismissed_ids = json_decode( $dismissed_ids ? $dismissed_ids : '[]', true );
		$board_cards   = get_post_meta( $project_id, self::META_BOARD_CARDS, true );
		$board_cards   = json_decode( $board_cards ? $board_cards : '[]', true );
		$query_log     = get_post_meta( $project_id, self::META_QUERY_LOG, true );
		$query_log     = json_decode( $query_log ? $query_log : '[]', true );

		$source_cards = $this->get_all_cards( $project_id );

		foreach ( $source_cards as &$card ) {
			$card['card_status'] = 'default';
			if ( in_array( $card['source_id'], $pinned_ids, true ) ) {
				$card['card_status'] = 'pinned';
			} elseif ( in_array( $card['source_id'], $dismissed_ids, true ) ) {
				$card['card_status'] = 'dismissed';
			}
		}
		unset( $card );

		foreach ( $board_cards as &$card ) {
			$card_id = $card['card_id'] ?? $card['type'] ?? '';
			$card['card_status'] = 'default';
			if ( in_array( $card_id, $pinned_ids, true ) ) {
				$card['card_status'] = 'pinned';
			} elseif ( in_array( $card_id, $dismissed_ids, true ) ) {
				$card['card_status'] = 'dismissed';
			}
		}
		unset( $card );

		$all_cards = array_merge( $board_cards, $source_cards );

		return array(
			'project_id'    => $project_id,
			'title'         => $project->post_title ?? '',
			'seed'          => $seed,
			'seed_analysis' => $seed_analysis,
			'assistants'    => $assistants,
			'cards'         => $all_cards,
			'pinned_ids'    => $pinned_ids,
			'dismissed_ids' => $dismissed_ids,
			'query_log'     => $query_log,
			'status'        => $project->post_status ?? 'active',
			'created_at'    => $project->post_date ?? '',
			// Reference "now" in the same frame as each card's updated_at, so the
			// frontend can age a card it loads mid-processing without guessing the
			// site timezone (the difference of two same-frame timestamps cancels it).
			'server_time'   => current_time( 'mysql' ),
		);
	}

	/**
	 * Check if a project is an ideation project.
	 *
	 * @param int $project_id Ideation project post ID.
	 */
	public static function is_ideation_project( int $project_id ): bool {
		$post = get_post( $project_id );
		return $post && IdeationPostTypes::POST_TYPE === $post->post_type;
	}

	// ─── Private Helpers ─────────────────────────────────────────

	/**
	 * Update assistant meta for a single assistant.
	 *
	 * Each assistant writes to its own meta key so concurrent runs
	 * never clobber each other.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $assistant_id Assistant ID.
	 * @param array  $result Result data.
	 */
	private function update_assistant_meta( int $project_id, string $assistant_id, array $result ): void {
		$key = self::META_ASSISTANT_PREFIX . self::sanitize_meta_key( $assistant_id );
		update_post_meta( $project_id, $key, wp_json_encode( $result ) );
	}

	/**
	 * Read all per-assistant meta keys and assemble the assistants map.
	 *
	 * Stored results carry requirement identity only, so this is where the
	 * message register is chosen — see add_reader_availability() — and where each
	 * assistant is given the name to display, see resolve_assistant_label().
	 *
	 * @param int $project_id Ideation project post ID.
	 */
	private function get_all_assistant_meta( int $project_id ): array {
		global $wpdb;

		$prefix = self::META_ASSISTANT_PREFIX;
		$rows   = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE %s",
				$project_id,
				$wpdb->esc_like( $prefix ) . '%'
			)
		);

		$abilities  = $this->get_abilities_by_name();
		$assistants = array();
		foreach ( $rows as $row ) {
			$suffix       = substr( $row->meta_key, strlen( $prefix ) );
			$assistant_id = self::unsanitize_meta_key( $suffix );
			$data         = json_decode( $row->meta_value, true );

			if ( ! is_array( $data ) ) {
				continue;
			}

			$ability = $abilities[ $assistant_id ] ?? null;

			$data['label'] = $this->resolve_assistant_label( $assistant_id, $ability );

			/*
			 * Keyed on the status rather than on `requirements`: an agent whose
			 * callback returned a bare `false` is unavailable but reports nothing
			 * to re-render, and gating on requirements would leave it with no
			 * `availability` key at all. The reader uses that key's presence to
			 * decide whether retrying can help, so a live-but-unconfigured agent
			 * has to carry it either way. A result that is not an availability
			 * failure has nothing to say here.
			 */
			$assistants[ $assistant_id ] = 'unavailable' === ( $data['status'] ?? '' )
				? $this->add_reader_availability( $data, $ability )
				: $data;
		}

		return $assistants;
	}

	/**
	 * The name to display for one assistant.
	 *
	 * Every stored assistant gets one, because the workspace header iterates the
	 * stored map: any id it cannot name renders as itself, and
	 * `workflow-discovery-foresight/foresight-research` in a status row is a leak of
	 * an internal identifier, not a label. Resolving it here rather than in the
	 * client removes the second set that could disagree with the first — the client
	 * previously built its labels from the research-abilities response, which is a
	 * different population from the stored meta and does not contain the analyst at
	 * all.
	 *
	 * Three sources, in order of authority:
	 *
	 *   1. The registered ability's own label. Correct for every research agent,
	 *      including one an administrator has disabled — disabling changes the
	 *      settings row, not the registration.
	 *   2. The Seed Analyst, which is invoked directly and never registered as an
	 *      ability, so it names itself.
	 *   3. The id, humanized. Only reachable when the agent's plugin has been
	 *      deactivated since the run: the record of what it did outlives its
	 *      registration, and there is no longer anywhere to read a real label from.
	 *      Derived rather than stored because a label stored at run time would be
	 *      frozen in the locale and wording of that run.
	 *
	 * @since 0.0.1
	 *
	 * @param  string      $assistant_id Ability name, or the analyst's id.
	 * @param  object|null $ability      The registered ability, when one is still registered.
	 * @return string
	 */
	private function resolve_assistant_label( string $assistant_id, ?object $ability ): string {
		if ( null !== $ability ) {
			return $ability->get_label();
		}

		$seed_analyst = new SeedAnalyst();

		if ( $seed_analyst->get_id() === $assistant_id ) {
			return $seed_analyst->get_label();
		}

		return self::humanize_assistant_id( $assistant_id );
	}

	/**
	 * Turn an ability name into something readable.
	 *
	 * Only the trailing segment is used: the vendor prefix names the plugin that
	 * registered the agent, not the agent, so
	 * `workflow-discovery-foresight/foresight-research` reads as "Foresight
	 * Research" rather than repeating the vendor.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $assistant_id Ability name.
	 * @return string
	 */
	private static function humanize_assistant_id( string $assistant_id ): string {
		$segments = explode( '/', $assistant_id );
		$slug     = (string) end( $segments );

		return ucwords( str_replace( array( '-', '_' ), ' ', $slug ) );
	}

	/**
	 * Add the availability payload phrased for whoever is reading it.
	 *
	 * The stored result names which requirements were unmet but never how to say
	 * so, because agent execution is gated on `edit_posts` while both the Agents
	 * screen and Settings → Connectors need `manage_options`. The same stored
	 * value therefore has to serve an administrator, who can be handed the
	 * destination, and an editor, who must never be sent to a screen they cannot
	 * open. `AvailabilitySerializer` owns that one capability check, and the
	 * ability's live availability is the only layer that can produce either
	 * wording.
	 *
	 * Re-rendering from live availability also means the payload cannot describe a
	 * requirement that has since been satisfied: the ability reports available and
	 * the groups come back empty. Clearing the stale `unavailable` status itself,
	 * and offering a per-agent retry, is deliberately out of scope here.
	 *
	 * @since 0.0.1
	 *
	 * @param  array       $data    The stored result.
	 * @param  object|null $ability The registered ability, when one is still registered.
	 * @return array The stored result, plus `availability` when a live source exists.
	 */
	private function add_reader_availability( array $data, ?object $ability ): array {
		if ( ! $ability instanceof Ability ) {
			// An agent's plugin can be deactivated after a run. The stored
			// identity stands as the record of what failed; there is simply no
			// live source left to phrase it from.
			return $data;
		}

		$data['availability'] = AvailabilitySerializer::serialize( $ability->get_availability() );

		return $data;
	}

	/**
	 * Every registered ability, keyed by its name.
	 *
	 * Read once per state assembly rather than scanned per assistant, and read from
	 * the registry rather than through `wp_get_ability()`, which emits a
	 * `_doing_it_wrong` notice on a miss — and a miss is expected here whenever an
	 * agent's plugin has been deactivated since the stored run.
	 *
	 * Not narrowed to our `Ability` subclass: a plain `WP_Ability` still knows its
	 * own label, and only the availability payload needs the subclass. Narrowing
	 * here would hand a correctly registered core ability the humanized fallback.
	 *
	 * @since 0.0.1
	 *
	 * @return array<string, object>
	 */
	private function get_abilities_by_name(): array {
		$abilities = array();

		foreach ( wp_get_abilities() as $ability ) {
			$abilities[ $ability->get_name() ] = $ability;
		}

		return $abilities;
	}

	/**
	 * Sanitize an assistant ID for use as a meta key suffix.
	 *
	 * @param string $assistant_id Assistant ID.
	 */
	private static function sanitize_meta_key( string $assistant_id ): string {
		return str_replace( '/', '__', $assistant_id );
	}

	/**
	 * Reverse sanitize_meta_key to recover the original assistant ID.
	 *
	 * @param string $suffix Suffix.
	 */
	private static function unsanitize_meta_key( string $suffix ): string {
		return str_replace( '__', '/', $suffix );
	}

	/**
	 * Get all cards (sources) for a project.
	 *
	 * @param int $project_id Ideation project post ID.
	 */
	private function get_all_cards( int $project_id ): array {
		global $wpdb;

		$table = $wpdb->prefix . 'vip_ideation_sources';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$sources = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT * FROM %i WHERE project_id = %d ORDER BY added_at ASC LIMIT 1000',
				$table,
				$project_id
			),
			ARRAY_A
		);

		if ( ! $sources ) {
			return array();
		}

		foreach ( $sources as &$source ) {
			if ( ! empty( $source['attachment_id'] ) && empty( $source['image'] ) ) {
				$url = wp_get_attachment_url( (int) $source['attachment_id'] );
				if ( $url ) {
					$source['image'] = $url;
					if ( empty( $source['url'] ) ) {
						$source['url'] = $url;
					}
				}
			}
		}
		unset( $source );

		return $sources;
	}

	/**
	 * Get specific cards by their source IDs.
	 *
	 * @param int   $project_id Ideation project post ID.
	 * @param array $source_ids Source IDs.
	 */
	private function get_cards_by_ids( int $project_id, array $source_ids ): array {
		if ( empty( $source_ids ) ) {
			return array();
		}

		global $wpdb;

		$table        = $wpdb->prefix . 'vip_ideation_sources';
		$placeholders = implode( ',', array_fill( 0, count( $source_ids ), '%s' ) );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$sources = $wpdb->get_results(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT * FROM {$table} WHERE project_id = %d AND source_id IN ({$placeholders})",
				array_merge( array( $project_id ), $source_ids )
			),
			ARRAY_A
		);

		if ( ! $sources ) {
			return array();
		}

		foreach ( $sources as &$source ) {
			if ( ! empty( $source['attachment_id'] ) && empty( $source['image'] ) ) {
				$url = wp_get_attachment_url( (int) $source['attachment_id'] );
				if ( $url ) {
					$source['image'] = $url;
					if ( empty( $source['url'] ) ) {
						$source['url'] = $url;
					}
				}
			}
		}
		unset( $source );

		return $sources;
	}

	/**
	 * Count total cards for a project.
	 *
	 * @param int $project_id Ideation project post ID.
	 */
	private function count_project_cards( int $project_id ): int {
		global $wpdb;

		$table = $wpdb->prefix . 'vip_ideation_sources';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM %i WHERE project_id = %d',
				$table,
				$project_id
			)
		);
	}

	/**
	 * A card's stable identity within a project, used as its `source_id`.
	 *
	 * Deterministic so that re-running an assistant lands on the row it created
	 * last time instead of minting a new one. `source_id` used to be a random
	 * string, which made the UNIQUE KEY on (project_id, source_id) unreachable
	 * and every re-run a fresh set of duplicates.
	 *
	 * URL first, because for a web result that is what identity means — the same
	 * page found twice is one source however its title was scraped. Generated
	 * content (a poem, a drafted angle) has no URL, so it falls back to title
	 * plus body: the only stable signal it carries. Deliberately NOT title alone,
	 * which would collapse two different pieces that happen to share a heading.
	 *
	 * Scoped by ability_id as well as project, so two assistants that surface the
	 * same URL each keep their own card — they carry different analysis, and
	 * merging them would lose one assistant's contribution. A manually added
	 * source passes null, which is its own scope for the same reason.
	 *
	 * Public because the sources controller mints ids for manually added URLs and
	 * must land on the same digest this does, or the two paths would disagree
	 * about what counts as the same source.
	 *
	 * @param  int         $project_id Ideation project post ID.
	 * @param  string|null $ability_id Ability that produced the card, null if manual.
	 * @param  array       $card       Raw card.
	 * @return string 20-char digest, matching the source_id column width.
	 */
	public static function card_identity( int $project_id, ?string $ability_id, array $card ): string {
		$url = trim( (string) ( $card['url'] ?? '' ) );

		/*
		 * Length-prefixed rather than separator-joined. Any separator can appear
		 * inside a scraped title or body — NUL included — and a plain join then
		 * lets two different cards produce one digest: title "a\0b" with body "c"
		 * would hash the same as title "a" with body "b\0c", silently collapsing
		 * them into a single row. The leading discriminator keeps a URL identity
		 * from colliding with a title-plus-body one.
		 */
		$parts = '' !== $url
			? array( 'url', $url )
			: array(
				'body',
				trim( (string) ( $card['title'] ?? '' ) ),
				(string) ( $card['content'] ?? '' ),
			);

		array_unshift( $parts, (string) $project_id, (string) $ability_id );

		$canonical = '';
		foreach ( $parts as $part ) {
			$canonical .= strlen( $part ) . ':' . $part . ';';
		}

		return substr( sha1( $canonical ), 0, 20 );
	}

	/**
	 * Store cards as research sources.
	 *
	 * Cards now declare their own source_type and origin. Falls back
	 * to inferring from the legacy 'type' field for compatibility.
	 *
	 * @param int     $project_id Ideation project post ID.
	 * @param array   $cards Card data.
	 * @param int     $user_id User ID.
	 * @param ?string $ability_id Ability ID.
	 */
	private function store_cards_as_sources( int $project_id, array $cards, int $user_id, ?string $ability_id = null ): void {
		global $wpdb;

		$table = $wpdb->prefix . 'vip_ideation_sources';
		$now   = current_time( 'mysql' );

		/*
		 * Identities already handled in THIS batch. The existence check below reads
		 * the database, which reflects state from before the loop started — so two
		 * cards with the same identity in one batch would both pass it and the
		 * second insert would fail on the unique index with nothing watching.
		 * Collapse them here, deliberately, rather than via a constraint violation.
		 */
		$seen_identities = array();

		foreach ( $cards as $card ) {
			$type = $card['type'] ?? 'unknown';

			if ( in_array( $type, self::BOARD_CARD_TYPES, true ) || 'mentor-guidance' === $type ) {
				continue;
			}

			$source_id = self::card_identity( $project_id, $ability_id, $card );

			/*
			 * Re-running an assistant re-offers the cards it found last time. With a
			 * content-derived source_id those land on the same row, so the UNIQUE KEY
			 * project_source (project_id, source_id) already refuses the duplicate —
			 * this check just keeps a re-run from raising a duplicate-key error for
			 * every card the project already holds. Existing rows are left as they
			 * are rather than refreshed: notes and pin state are keyed on source_id,
			 * and a re-run should not quietly rewrite content a user has annotated.
			 */
			if ( isset( $seen_identities[ $source_id ] ) ) {
				continue;
			}
			$seen_identities[ $source_id ] = true;

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$already_stored = $wpdb->get_var(
				$wpdb->prepare(
					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $table is $wpdb->prefix + a literal; both values are placeholders.
					"SELECT COUNT(*) FROM {$table} WHERE project_id = %d AND source_id = %s",
					$project_id,
					$source_id
				)
			);

			/*
			 * A failed query returns null, and casting that to int gives 0 —
			 * indistinguishable from "no such row". The loop would then insert a
			 * duplicate on the strength of a database error. Bail instead of guessing.
			 */
			if ( null === $already_stored ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- data-integrity failure worth surfacing.
				error_log(
					sprintf(
						'[VIP Workflows] Could not check for an existing ideation source (project %d, source %s): %s',
						$project_id,
						$source_id,
						$wpdb->last_error
					)
				);
				return;
			}

			if ( (int) $already_stored > 0 ) {
				continue;
			}

			// Prefer explicit source_type/origin from the card; infer from type as fallback.
			$source_type = $card['source_type'] ?? 'article';
			$origin      = $card['origin'] ?? 'search';

			if ( ! isset( $card['source_type'] ) ) {
				if ( 'image' === $type ) {
					$source_type = 'image';
				} elseif ( 'video' === $type ) {
					$source_type = 'video';
				}
			}

			if ( ! isset( $card['origin'] ) ) {
				if ( 'archive-article' === $type ) {
					$origin = 'archive';
				} elseif ( 'image' === $type && ! empty( $card['is_generated'] ) ) {
					$origin = 'ai_generated';
				}
			}

			$inserted = $wpdb->insert(
				$table,
				array(
					'project_id'   => $project_id,
					'source_id'    => $source_id,
					'url'          => $card['url'] ?? null,
					'title'        => $card['title'] ?? null,
					'domain'       => $card['domain'] ?? null,
					'image'        => $card['image'] ?? $card['thumbnail'] ?? null,
					'published_at' => $card['date'] ?? null,
					'author'       => $card['author'] ?? null,
					'excerpt'      => $card['excerpt'] ?? null,
					'content'      => $card['content'] ?? null,
					'source_type'  => $source_type,
					'origin'       => $origin,
					'ability_id'   => $ability_id,
					'group_id'     => $card['group_id'] ?? null,
					'added_by'     => $user_id,
					'added_at'     => $now,
					'updated_at'   => $now,
					'ai_analysis'  => wp_json_encode(
						array_filter(
							array(
								'assistant'    => $card['source'] ?? $type,
								'score'        => $card['score'] ?? null,
								'post_id'      => $card['post_id'] ?? null,
								'provider'     => $card['provider'] ?? null,
								'is_generated' => $card['is_generated'] ?? false,
								'duration'     => $card['duration'] ?? null,
								'thumbnail'    => $card['thumbnail'] ?? null,
								'channel'      => $card['channel'] ?? null,
							),
							fn( $v ) => null !== $v
						)
					),
				),
				array( '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s' )
			);

			/*
			 * With source_id content-derived the unique index is reachable, so a failed
			 * insert is now a real possibility (a concurrent run for the same project)
			 * rather than an impossibility. Losing a card silently is the class of thing
			 * this change exists to stop.
			 */
			if ( false === $inserted ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- data-integrity failure worth surfacing.
				error_log(
					sprintf(
						'[VIP Workflows] Could not store ideation source (project %d, source %s): %s',
						$project_id,
						$source_id,
						$wpdb->last_error
					)
				);
			}
		}
	}

	/**
	 * Set an assistant's status in project meta.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $assistant_id Assistant ID.
	 * @param string $status Status value.
	 */
	private function set_assistant_status( int $project_id, string $assistant_id, string $status ): void {
		$statuses = get_post_meta( $project_id, '_vip_ideation_assistant_statuses', true );
		$statuses = json_decode( $statuses ? $statuses : '{}', true );
		$statuses[ $assistant_id ] = array(
			'status'     => $status,
			'updated_at' => current_time( 'mysql' ),
		);
		update_post_meta( $project_id, '_vip_ideation_assistant_statuses', wp_json_encode( $statuses ) );
	}

	/**
	 * Log a follow-up query.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $query Search query.
	 * @param string $assistant_id Assistant ID.
	 * @param array  $result Result data.
	 */
	private function log_query( int $project_id, string $query, string $assistant_id, array $result ): void {
		$log = get_post_meta( $project_id, self::META_QUERY_LOG, true );
		$log = json_decode( $log ? $log : '[]', true );

		$log[] = array(
			'id'         => wp_generate_password( 8, false ),
			'query'      => $query,
			'assistant'  => $assistant_id,
			'status'     => $result['status'] ?? 'unknown',
			'card_count' => count( $result['cards'] ?? array() ),
			'summary'    => $result['summary'] ?? '',
			'timestamp'  => current_time( 'mysql' ),
		);

		update_post_meta( $project_id, self::META_QUERY_LOG, wp_json_encode( $log ) );
	}

	/**
	 * Get brand knowledge context relevant to the seed.
	 *
	 * @param string $seed Ideation seed text.
	 */
	private function get_brand_context( string $seed ): array {
		unset( $seed );

		$guidelines = GuidelineContextProvider::gather_context();

		if ( 'No guideline context available.' === $guidelines ) {
			return array();
		}

		return array(
			array(
				'title'   => __( 'Content Guidelines', 'vip-workflows' ),
				'content' => trim( wp_strip_all_tags( $guidelines ) ),
			),
		);
	}
}
