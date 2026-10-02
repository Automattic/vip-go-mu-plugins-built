<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class Annotations extends \WP\McpSchema\Record
{
    public const DEFINITION = 'Annotations';

    /**
     * @return array<int, 'assistant'|'user'>|null
     */
    public function getAudience(): ?array
    {
        /** @var array<int, 'assistant'|'user'>|null $value */
        $value = $this->declaredValue('audience');

        return $value;
    }

    /**
     * @return null|string
     */
    public function getLastModified(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('lastModified');

        return $value;
    }

    /**
     * @return float|int|null
     */
    public function getPriority()
    {
        /** @var float|int|null $value */
        $value = $this->declaredValue('priority');

        return $value;
    }
}
