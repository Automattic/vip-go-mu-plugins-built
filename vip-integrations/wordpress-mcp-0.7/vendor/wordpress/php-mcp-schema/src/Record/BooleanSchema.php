<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class BooleanSchema extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\PrimitiveSchemaDefinition
{
    public const DEFINITION = 'BooleanSchema';

    /**
     * @return bool|null
     */
    public function getDefault(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('default');

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
     * @return null|string
     */
    public function getTitle(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('title');

        return $value;
    }

    /**
     * @return 'boolean'
     */
    public function getType(): string
    {
        /** @var 'boolean' $value */
        $value = $this->declaredValue('type');

        return $value;
    }
}
