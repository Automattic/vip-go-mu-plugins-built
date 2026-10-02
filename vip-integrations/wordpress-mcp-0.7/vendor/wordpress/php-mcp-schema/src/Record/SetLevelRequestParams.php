<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SetLevelRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'SetLevelRequestParams';

    /**
     * @return \stdClass|null
     */
    public function getMeta(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return 'alert'|'critical'|'debug'|'emergency'|'error'|'info'|'notice'|'warning'
     */
    public function getLevel(): string
    {
        /** @var 'alert'|'critical'|'debug'|'emergency'|'error'|'info'|'notice'|'warning' $value */
        $value = $this->declaredValue('level');

        return $value;
    }
}
