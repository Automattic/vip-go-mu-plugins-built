<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class NotificationParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'NotificationParams';

    /**
     * @return \WP\McpSchema\Record\NotificationMetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\NotificationMetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }
}
