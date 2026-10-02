<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SubscriptionsListenResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ServerResult
{
    public const DEFINITION = 'SubscriptionsListenResult';

    /**
     * @return \WP\McpSchema\Record\SubscriptionsListenResultMetaObject
     */
    public function getMeta(): \WP\McpSchema\Record\SubscriptionsListenResultMetaObject
    {
        /** @var \WP\McpSchema\Record\SubscriptionsListenResultMetaObject $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return string
     */
    public function getResultType(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('resultType');

        return $value;
    }
}
