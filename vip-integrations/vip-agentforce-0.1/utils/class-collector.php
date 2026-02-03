<?php
/**
 * Prometheus metrics collector for VIP Agentforce plugin.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Utils;

use Prometheus\RegistryInterface;

/**
 * @codeCoverageIgnore
 */
class Collector implements \Automattic\VIP\Prometheus\CollectorInterface {

	public function initialize( RegistryInterface $registry ): void {
		/* Do nothing */
	}

	public function collect_metrics(): void {
		/* Do nothing */
	}

	public function process_metrics(): void {
		/* Do nothing */
	}
}
