<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class RelatedTaskMetadata extends \WP\McpSchema\Record
{
    public const DEFINITION = 'RelatedTaskMetadata';

    /**
     * @return string
     */
    public function getTaskId(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('taskId');

        return $value;
    }
}
