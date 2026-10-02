<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class GetTaskPayloadResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientResult, \WP\McpSchema\Contract\ServerResult
{
    public const DEFINITION = 'GetTaskPayloadResult';

    /**
     * @return \stdClass|null
     */
    public function getMeta(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }
}
