<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class GetPromptRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'GetPromptRequestParams';

    /**
     * @return \WP\McpSchema\Record\RequestMetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\RequestMetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getArguments(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('arguments');

        return $value;
    }

    /**
     * Declared in: 2026-07-28.
     *
     * @return \WP\McpSchema\Record\InputResponses|null
     */
    public function getInputResponses(): ?\WP\McpSchema\Record\InputResponses
    {
        /** @var \WP\McpSchema\Record\InputResponses|null $value */
        $value = $this->declaredValue('inputResponses');

        return $value;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('name');

        return $value;
    }

    /**
     * Declared in: 2026-07-28.
     *
     * @return null|string
     */
    public function getRequestState(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('requestState');

        return $value;
    }
}
