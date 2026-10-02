<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SamplingMessage extends \WP\McpSchema\Record
{
    public const DEFINITION = 'SamplingMessage';

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
     * @return \WP\McpSchema\Record\AudioContent|\WP\McpSchema\Record\ImageContent|\WP\McpSchema\Record\TextContent|\WP\McpSchema\Record\ToolResultContent|\WP\McpSchema\Record\ToolUseContent|array<int, \WP\McpSchema\Contract\SamplingMessageContentBlock>
     */
    public function getContent()
    {
        /** @var \WP\McpSchema\Record\AudioContent|\WP\McpSchema\Record\ImageContent|\WP\McpSchema\Record\TextContent|\WP\McpSchema\Record\ToolResultContent|\WP\McpSchema\Record\ToolUseContent|array<int, \WP\McpSchema\Contract\SamplingMessageContentBlock> $value */
        $value = $this->declaredValue('content');

        return $value;
    }

    /**
     * @return 'assistant'|'user'
     */
    public function getRole(): string
    {
        /** @var 'assistant'|'user' $value */
        $value = $this->declaredValue('role');

        return $value;
    }
}
