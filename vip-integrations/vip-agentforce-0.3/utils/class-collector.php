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
		Ingestion_Metrics::initialize( $registry );
	}

	public function collect_metrics(): void {
		Ingestion_Metrics::collect_gauges();
		Ingestion_Metrics::collect_counters();
	}

	public function process_metrics(): void {
		/* Do nothing */
	}
}
