<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class Prompt extends \WP\McpSchema\Record
{
    public const DEFINITION = 'Prompt';

    /**
     * @return \WP\McpSchema\Record\MetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\MetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return array<int, \WP\McpSchema\Record\PromptArgument>|null
     */
    public function getArguments(): ?array
    {
        /** @var array<int, \WP\McpSchema\Record\PromptArgument>|null $value */
        $value = $this->declaredValue('arguments');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getDescription(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('description');

        return $value;
    }

    /**
     * @return array<int, \WP\McpSchema\Record\Icon>|null
     */
    public function getIcons(): ?array
    {
        /** @var array<int, \WP\McpSchema\Record\Icon>|null $value */
        $value = $this->declaredValue('icons');

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
     * @return null|string
     */
    public function getTitle(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('title');

        return $value;
    }
}
