<?php
/**
 * Developer mode setup.
 *
 * Loaded only when VIP_AGENTFORCE_DEVELOPER_MODE is true.
 *
 * @package vip-agentforce
 */

// Mock Ingestion API for local testing.
if ( defined( 'VIP_AGENTFORCE_MOCK_INGESTION_API' ) && true === VIP_AGENTFORCE_MOCK_INGESTION_API ) {
	require_once __DIR__ . '/mock-ingestion-api.php';
}
