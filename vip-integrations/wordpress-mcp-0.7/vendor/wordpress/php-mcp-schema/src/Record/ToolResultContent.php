<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ToolResultContent extends \WP\McpSchema\Record implements \WP\McpSchema\Contract\SamplingMessageContentBlock
{
    public const DEFINITION = 'ToolResultContent';

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
     * @return array<int, \WP\McpSchema\Contract\ContentBlock>
     */
    public function getContent(): array
    {
        /** @var array<int, \WP\McpSchema\Contract\ContentBlock> $value */
        $value = $this->declaredValue('content');

        return $value;
    }

    /**
     * @return bool|null
     */
    public function getIsError(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('isError');

        return $value;
    }

    /**
     * @return \stdClass|mixed|null
     */
    public function getStructuredContent()
    {
        /** @var \stdClass|mixed|null $value */
        $value = $this->declaredValue('structuredContent');

        return $value;
    }

    /**
     * @return string
     */
    public function getToolUseId(): string
    {
        /** @var string $value */
        $value = $this->declaredValue('toolUseId');

        return $value;
    }

    /**
     * @return 'tool_result'
     */
    public function getType(): string
    {
        /** @var 'tool_result' $value */
        $value = $this->declaredValue('type');

        return $value;
    }
}
