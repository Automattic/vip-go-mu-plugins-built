<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class InitializeResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ServerResult
{
    public const DEFINITION = 'InitializeResult';

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
     * @return \WP\McpSchema\Record\ServerCapabilities
     */
    public function getCapabilities(): \WP\McpSchema\Record\ServerCapabilities
    {
        /** @var \WP\McpSchema\Record\ServerCapabilities $value */
        $value = $this->declaredValue('capabilities');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getInstructions(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('instructions');

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

    /**
     * @return \WP\McpSchema\Record\Implementation
     */
    public function getServerInfo(): \WP\McpSchema\Record\Implementation
    {
        /** @var \WP\McpSchema\Record\Implementation $value */
        $value = $this->declaredValue('serverInfo');

        return $value;
    }
}
