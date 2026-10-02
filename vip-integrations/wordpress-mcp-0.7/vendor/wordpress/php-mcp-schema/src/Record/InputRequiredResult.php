<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class InputRequiredResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ServerResult
{
    public const DEFINITION = 'InputRequiredResult';

    /**
     * @return \WP\McpSchema\Record\ResultMetaObject|null
     */
    public function getMeta(): ?\WP\McpSchema\Record\ResultMetaObject
    {
        /** @var \WP\McpSchema\Record\ResultMetaObject|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\InputRequests|null
     */
    public function getInputRequests(): ?\WP\McpSchema\Record\InputRequests
    {
        /** @var \WP\McpSchema\Record\InputRequests|null $value */
        $value = $this->declaredValue('inputRequests');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getRequestState(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('requestState');

        return $value;
    }

    /**
     * @return string
     */
    public function getResultType(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('resultType');

        return $value;
    }
}
