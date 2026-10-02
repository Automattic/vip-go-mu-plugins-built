<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class InputResponseRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'InputResponseRequestParams';

    /**
     * @return \WP\McpSchema\Record\RequestMetaObject
     */
    public function getMeta(): \WP\McpSchema\Record\RequestMetaObject
    {
        /** @var \WP\McpSchema\Record\RequestMetaObject $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\InputResponses|null
     */
    public function getInputResponses(): ?\WP\McpSchema\Record\InputResponses
    {
        /** @var \WP\McpSchema\Record\InputResponses|null $value */
        $value = $this->declaredValue('inputResponses');

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
}
