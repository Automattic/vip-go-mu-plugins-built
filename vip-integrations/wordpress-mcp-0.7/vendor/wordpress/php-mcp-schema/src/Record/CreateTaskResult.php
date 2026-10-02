<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class CreateTaskResult extends \WP\McpSchema\Record
{
    public const DEFINITION = 'CreateTaskResult';

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
     * @return \WP\McpSchema\Record\Task
     */
    public function getTask(): \WP\McpSchema\Record\Task
    {
        /** @var \WP\McpSchema\Record\Task $value */
        $value = $this->declaredValue('task');

        return $value;
    }
}
