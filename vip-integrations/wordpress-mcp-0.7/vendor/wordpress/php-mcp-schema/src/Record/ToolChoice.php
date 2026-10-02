<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ToolChoice extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ToolChoice';

    /**
     * @return 'auto'|'none'|'required'|null
     */
    public function getMode(): ?string
    {
        /** @var 'auto'|'none'|'required'|null $value */
        $value = $this->declaredValue('mode');

        return $value;
    }
}
