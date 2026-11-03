<?php
/** Legacy global class names retained for existing Reprint Server consumers. */

$reprint_server_class_aliases = [
    'Site_Export_HMAC_Server' => \WordPress\Reprint\Server\HMACServer::class,
    'Site_Export_HTTP_Server' => \WordPress\Reprint\Server\HTTPServer::class,
    'Site_Export_Multipart_Processor' => \WordPress\Reprint\Server\MultipartProcessor::class,
    'Site_Export_Push_Configuration_Exception' => \WordPress\Reprint\Server\PushConfigurationException::class,
    'Site_Export_Push_Endpoints' => \WordPress\Reprint\Server\PushEndpoints::class,
    'Site_Export_Push_Exception' => \WordPress\Reprint\Server\PushException::class,
    'Site_Export_Push_Session' => \WordPress\Reprint\Server\PushSession::class,
];

spl_autoload_register(
    static function ($requested_class) use ($reprint_server_class_aliases) {
        if (
            isset($reprint_server_class_aliases[$requested_class])
            && !class_exists($requested_class, false)
        ) {
            $canonical_class = $reprint_server_class_aliases[$requested_class];
            class_exists($canonical_class);
        }
    }
);

unset($reprint_server_class_aliases);
