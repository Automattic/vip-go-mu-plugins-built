<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class Result extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientResult, \WP\McpSchema\Contract\ServerResult
{
    public const DEFINITION = 'Result';

    /**
     * @return \WP\McpSchema\Record\ResultMetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\ResultMetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * Declared in: 2026-07-28.
     *
     * @return null|string
     */
    public function getResultType(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('resultType');

        return $value;
    }
}
