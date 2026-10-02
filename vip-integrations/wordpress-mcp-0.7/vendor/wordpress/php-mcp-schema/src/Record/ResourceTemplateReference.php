<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ResourceTemplateReference extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ResourceTemplateReference';

    /**
     * @return 'ref/resource'
     */
    public function getType(): string
    {
        /** @var 'ref/resource' $value */
        $value = $this->declaredValue('type');

        return $value;
    }

    /**
     * @return string
     */
    public function getUri(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('uri');

        return $value;
    }
}
