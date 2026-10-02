<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class BaseMetadata extends \WP\McpSchema\Record
{
    public const DEFINITION = 'BaseMetadata';

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
