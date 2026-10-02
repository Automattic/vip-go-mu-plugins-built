<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class Icon extends \WP\McpSchema\Record
{
    public const DEFINITION = 'Icon';

    /**
     * @return null|string
     */
    public function getMimeType(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('mimeType');

        return $value;
    }

    /**
     * @return array<int, string>|null
     */
    public function getSizes(): ?array
    {
        /** @var array<int, string>|null $value */
        $value = $this->declaredValue('sizes');

        return $value;
    }

    /**
     * @return string
     */
    public function getSrc(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('src');

        return $value;
    }

    /**
     * @return 'dark'|'light'|null
     */
    public function getTheme(): ?string
    {
        /** @var 'dark'|'light'|null $value */
        $value = $this->declaredValue('theme');

        return $value;
    }
}
