<?php
namespace Automattic\VIP\Salesforce\Agentforce\Utils\Traits;

trait WithPluginPaths {

	private string $vip_agentforce_integration_path;
	private string $vip_agentforce_integration_url;

	protected function get_integration_path(): string {
		if ( ! isset( $this->vip_agentforce_integration_path ) ) {
			$this->vip_agentforce_integration_path = untrailingslashit( plugin_dir_path( VIP_AGENTFORCE_FILE ) );
		}
		return $this->vip_agentforce_integration_path;
	}
	protected function get_integration_url(): string {
		if ( ! isset( $this->vip_agentforce_integration_url ) ) {
			$this->vip_agentforce_integration_url = untrailingslashit( plugin_dir_url( VIP_AGENTFORCE_FILE ) );
		}
		return $this->vip_agentforce_integration_url;
	}
}
