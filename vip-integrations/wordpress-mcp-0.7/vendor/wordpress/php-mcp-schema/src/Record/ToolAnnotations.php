<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ToolAnnotations extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ToolAnnotations';

    /**
     * @return bool|null
     */
    public function getDestructiveHint(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('destructiveHint');

        return $value;
    }

    /**
     * @return bool|null
     */
    public function getIdempotentHint(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('idempotentHint');

        return $value;
    }

    /**
     * @return bool|null
     */
    public function getOpenWorldHint(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('openWorldHint');

        return $value;
    }

    /**
     * @return bool|null
     */
    public function getReadOnlyHint(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('readOnlyHint');

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
