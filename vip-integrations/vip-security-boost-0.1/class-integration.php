<?php

namespace Automattic\VIP\Security;

class Integration extends \Automattic\VIP\Integrations\Integration {
	protected string $version = '1.0';

	public function is_loaded(): bool {
		return class_exists( \Automattic\VIP\Security\Loader::class );
	}

	public function load(): void {
		if ( $this->is_loaded() ) {
			return;
		}

		$configs = $this->get_env_config();

		if ( ! defined( 'VIP_SECURITY_BOOST_CONFIGS' ) ) {
			define( 'VIP_SECURITY_BOOST_CONFIGS', $configs );
		}
	}
}
