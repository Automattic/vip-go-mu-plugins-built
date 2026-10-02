<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class CompleteRequestParams extends \WP\McpSchema\Record
{
    public const DEFINITION = 'CompleteRequestParams';

    /**
     * @return \WP\McpSchema\Record\RequestMetaObject|\stdClass|null
     */
    public function getMeta()
    {
        /** @var \WP\McpSchema\Record\RequestMetaObject|\stdClass|null $value */
        $value = $this->declaredValue('_meta');

        return $value;
    }

    /**
     * @return \stdClass
     */
    public function getArgument(): \stdClass
    {
        /** @var \stdClass $value */
        $value = $this->declaredValue('argument');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getContext(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('context');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\PromptReference|\WP\McpSchema\Record\ResourceTemplateReference
     */
    public function getRef()
    {
        /** @var \WP\McpSchema\Record\PromptReference|\WP\McpSchema\Record\ResourceTemplateReference $value */
        $value = $this->declaredValue('ref');

        return $value;
    }
}
