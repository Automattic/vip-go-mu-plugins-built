<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class PromptMessage extends \WP\McpSchema\Record
{
    public const DEFINITION = 'PromptMessage';

    /**
     * @return \WP\McpSchema\Contract\ContentBlock
     */
    public function getContent(): \WP\McpSchema\Contract\ContentBlock
    {
        /** @var \WP\McpSchema\Contract\ContentBlock $value */
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
