<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class EmbeddedResource extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ContentBlock
{
    public const DEFINITION = 'EmbeddedResource';

    /**
     * @return \WP\McpSchema\Record\MetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\MetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\Annotations|null
     */
    public function getAnnotations(): ?\WP\McpSchema\Record\Annotations
    {
        /** @var \WP\McpSchema\Record\Annotations|null $value */
        $value = $this->declaredValue('annotations');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\BlobResourceContents|\WP\McpSchema\Record\TextResourceContents
     */
    public function getResource()
    {
        /** @var \WP\McpSchema\Record\BlobResourceContents|\WP\McpSchema\Record\TextResourceContents $value */
        $value = $this->declaredValue('resource');

        return $value;
    }

    /**
     * @return 'resource'
     */
    public function getType(): string
    {
        /** @var 'resource' $value */
        $value = $this->declaredValue('type');

        return $value;
    }
}
