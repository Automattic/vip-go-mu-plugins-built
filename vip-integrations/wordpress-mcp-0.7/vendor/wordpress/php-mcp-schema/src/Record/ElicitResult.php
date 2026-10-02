<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ElicitResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientResult, \WP\McpSchema\Contract\InputResponse
{
    public const DEFINITION = 'ElicitResult';

    /**
     * Declared in: 2025-11-25.
     *
     * @return \stdClass|null
     */
    public function getMeta(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return 'accept'|'cancel'|'decline'
     */
    public function getAction(): string
    {
        /** @var 'accept'|'cancel'|'decline' $value */
        $value = $this->declaredValue('action');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getContent(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('content');

        return $value;
    }
}
