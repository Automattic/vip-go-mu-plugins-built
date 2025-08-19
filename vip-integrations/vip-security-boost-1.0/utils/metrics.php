<?php

namespace Automattic\VIP\Security\Utils;

if ( ! class_exists( 'Automattic\\VIP\\Prometheus\\Plugin' ) ) {
	return;
}

require_once __DIR__ . '/class-collector.php';

add_filter( 'vip_prometheus_collectors', function ( $collectors ) {
	$collectors['vip_security_boost'] = new Collector();

	return $collectors;
} );
