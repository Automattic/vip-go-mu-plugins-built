<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ResultMetaObject extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ResultMetaObject';

    /**
     * @return \WP\McpSchema\Record\Implementation|null
     */
    public function getIoModelcontextprotocolServerInfo(): ?\WP\McpSchema\Record\Implementation
    {
        /** @var \WP\McpSchema\Record\Implementation|null $value */
        $value = $this->declaredValue('io.modelcontextprotocol/serverInfo');

        return $value;
    }
}
