<?php

namespace WordPress\Reprint\Server;

use InvalidArgumentException;

/**
 * Reports invalid server-owned push endpoint configuration.
 */
final class PushConfigurationException extends InvalidArgumentException {
}

if (!class_exists('Site_Export_Push_Configuration_Exception', false)) {
    class_alias(PushConfigurationException::class, 'Site_Export_Push_Configuration_Exception');
}
