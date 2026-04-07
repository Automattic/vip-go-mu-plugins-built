<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Api;

defined( 'ABSPATH' ) || exit();

/**
 * WordPress REST API
 */
final class RestApi {
	const NAMESPACE = 'vip-rtc/v1';

	public static function init(): void {
		add_action( 'rest_api_init', [ new AuthApiController(), 'register_routes' ], 10, 0 );
	}
}
