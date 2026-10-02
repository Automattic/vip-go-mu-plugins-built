<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class NumberSchema extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\PrimitiveSchemaDefinition
{
    public const DEFINITION = 'NumberSchema';

    /**
     * @return float|int|null
     */
    public function getDefault()
    {
        /** @var float|int|null $value */
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
     * @return float|int|null
     */
    public function getMaximum()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('maximum');

        return $value;
    }

    /**
     * @return float|int|null
     */
    public function getMinimum()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('minimum');

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
     * @return 'integer'|'number'
     */
    public function getType(): string
    {
        /** @var 'integer'|'number' $value */
        $value = $this->declaredValue('type');

        return $value;
    }
}
