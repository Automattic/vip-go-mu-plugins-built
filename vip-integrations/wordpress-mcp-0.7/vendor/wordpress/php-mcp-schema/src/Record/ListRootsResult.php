<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ListRootsResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientResult, \WP\McpSchema\Contract\InputResponse
{
    public const DEFINITION = 'ListRootsResult';

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
     * @return array<int, \WP\McpSchema\Record\Root>
     */
    public function getRoots(): array
    {
        /** @var array<int, \WP\McpSchema\Record\Root> $value */
        $value = $this->declaredValue('roots');

        return $value;
    }
}
