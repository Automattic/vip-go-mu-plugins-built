<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class RequestMetaObject extends \WP\McpSchema\Record
{
    public const DEFINITION = 'RequestMetaObject';

    /**
     * @return \WP\McpSchema\Record\ClientCapabilities
     */
    public function getIoModelcontextprotocolClientCapabilities(): \WP\McpSchema\Record\ClientCapabilities
    {
        /** @var \WP\McpSchema\Record\ClientCapabilities $value */
        $value = $this->declaredValue('io.modelcontextprotocol/clientCapabilities');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\Implementation|null
     */
    public function getIoModelcontextprotocolClientInfo(): ?\WP\McpSchema\Record\Implementation
    {
        /** @var \WP\McpSchema\Record\Implementation|null $value */
        $value = $this->declaredValue('io.modelcontextprotocol/clientInfo');

        return $value;
    }

    /**
     * @return 'alert'|'critical'|'debug'|'emergency'|'error'|'info'|'notice'|'warning'|null
     */
    public function getIoModelcontextprotocolLogLevel(): ?string
    {
        /** @var 'alert'|'critical'|'debug'|'emergency'|'error'|'info'|'notice'|'warning'|null $value */
        $value = $this->declaredValue('io.modelcontextprotocol/logLevel');

        return $value;
    }

    /**
     * @return string
     */
    public function getIoModelcontextprotocolProtocolVersion(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('io.modelcontextprotocol/protocolVersion');

        return $value;
    }

    /**
     * @return float|int|null|string
     */
    public function getProgressToken()
    {
        /** @var float|int|null|string $value */
        $value = $this->declaredValue('progressToken');

        return $value;
    }
}
