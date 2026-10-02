<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class StringSchema extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\PrimitiveSchemaDefinition
{
    public const DEFINITION = 'StringSchema';

    /**
     * @return null|string
     */
    public function getDefault(): ?string
    {
        /** @var null|string $value */
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
     * @return 'date'|'date-time'|'email'|'uri'|null
     */
    public function getFormat(): ?string
    {
        /** @var 'date'|'date-time'|'email'|'uri'|null $value */
        $value = $this->declaredValue('format');

        return $value;
    }

    /**
     * @return float|int|null
     */
    public function getMaxLength()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('maxLength');

        return $value;
    }

    /**
     * @return float|int|null
     */
    public function getMinLength()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('minLength');

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
     * @return 'string'
     */
    public function getType(): string
    {
        /** @var 'string' $value */
        $value = $this->declaredValue('type');

        return $value;
    }
}
