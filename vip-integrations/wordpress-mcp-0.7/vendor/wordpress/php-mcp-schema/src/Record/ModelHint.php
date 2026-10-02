<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ModelHint extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ModelHint';

    /**
     * @return null|string
     */
    public function getName(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('name');

        return $value;
    }
}
