<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class InitializeRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'InitializeRequestParams';

    /**
     * @return \stdClass|null
     */
    public function getMeta(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\ClientCapabilities
     */
    public function getCapabilities(): \WP\McpSchema\Record\ClientCapabilities
    {
        /** @var \WP\McpSchema\Record\ClientCapabilities $value */
        $value = $this->declaredValue('capabilities');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\Implementation
     */
    public function getClientInfo(): \WP\McpSchema\Record\Implementation
    {
        /** @var \WP\McpSchema\Record\Implementation $value */
        $value = $this->declaredValue('clientInfo');

        return $value;
    }

    /**
     * @return string
     */
    public function getProtocolVersion(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('protocolVersion');

        return $value;
    }
}
