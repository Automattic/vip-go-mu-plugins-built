<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class CreateMessageResult extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\ClientResult, \WP\McpSchema\Contract\InputResponse
{
    public const DEFINITION = 'CreateMessageResult';

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
     * @return string
     */
    public function getModel(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('model');

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

    /**
     * @return null|string
     */
    public function getStopReason(): ?string
    {
        /** @var null|string $value */
        $value = $this->declaredValue('stopReason');

        return $value;
    }
}
