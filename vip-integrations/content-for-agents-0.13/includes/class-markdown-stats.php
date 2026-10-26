<?php
/**
 * Sampled MC Stats for Markdown responses.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Records served documents and block callback execution.
 */
class Markdown_Stats {
	private const SAMPLE_RATE   = 10;
	private const SERVED_STAT   = 'content-for-agents-markdown-served';
	private const CALLBACK_STAT = 'content-for-agents-block-callback-used';

	/** @var callable|null */
	private $sender;

	/** @var array<string, int> */
	private array $stats = array();

	/**
	 * @param callable|null $sender Optional pixel sender for tests.
	 */
	public function __construct( ?callable $sender = null ) {
		$this->sender = $sender;
	}

	/**
	 * Queue at most two counters for one successful Markdown response.
	 *
	 * @param bool $callback_used Whether a block callback ran while building this response.
	 */
	public function record_served( bool $callback_used ): void {
		if ( ! defined( 'WPCOM_IS_VIP_ENV' ) || true !== WPCOM_IS_VIP_ENV
			|| ! defined( 'WPCOM_SANDBOXED' ) || false !== WPCOM_SANDBOXED
			|| ! defined( 'FILES_CLIENT_SITE_ID' )
			|| ( null === $this->sender && ! function_exists( '\\Automattic\\VIP\\Stats\\send_pixel' ) )
		) {
			return;
		}

		if ( ! $this->is_sampled() ) {
			return;
		}

		$this->stats[ self::SERVED_STAT ] = (int) FILES_CLIENT_SITE_ID;
		if ( $callback_used ) {
			$this->stats[ self::CALLBACK_STAT ] = (int) FILES_CLIENT_SITE_ID;
		}

		add_action( 'shutdown', array( $this, 'send' ) );
	}

	/** Whether to record this response. */
	protected function is_sampled(): bool {
		return 1 === wp_rand( 1, self::SAMPLE_RATE );
	}

	/** Send the sampled counters together after the response body. */
	public function send(): void {
		if ( empty( $this->stats ) ) {
			return;
		}

		$stats       = $this->stats;
		$this->stats = array();
		try {
			if ( null !== $this->sender ) {
				call_user_func( $this->sender, $stats );
			} else {
				\Automattic\VIP\Stats\send_pixel( $stats );
			}
		} catch ( \Throwable ) {
			// Statistics must not interrupt the response.
			return;
		}
	}
}
