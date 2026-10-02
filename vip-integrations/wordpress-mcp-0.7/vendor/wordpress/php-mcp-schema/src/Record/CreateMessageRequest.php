<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class CreateMessageRequest extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\InputRequest, \WP\McpSchema\Contract\ServerRequest
{
    public const DEFINITION = 'CreateMessageRequest';

    /**
     * Declared in: 2025-11-25.
     *
     * @return float|int|null|string
     */
    public function getId()
    {
        /** @var float|int|null|string $value */
        $value = $this->declaredValue('id');

        return $value;
    }

    /**
     * Declared in: 2025-11-25.
     *
     * @return '2.0'|null
     */
    public function getJsonrpc(): ?string
    {
        /** @var '2.0'|null $value */
        $value = $this->declaredValue('jsonrpc');

        return $value;
    }

    /**
     * @return 'sampling/createMessage'
     */
    public function getMethod(): string
    {
        /** @var 'sampling/createMessage' $value */
        $value = $this->declaredValue('method');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\CreateMessageRequestParams
     */
    public function getParams(): \WP\McpSchema\Record\CreateMessageRequestParams
    {
        /** @var \WP\McpSchema\Record\CreateMessageRequestParams $value */
        $value = $this->declaredValue('params');

        return $value;
    }
}
