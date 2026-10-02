<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ServerCapabilities extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ServerCapabilities';

    /**
     * @return \WP\McpSchema\Record\JSONObject|\stdClass|null
     */
    public function getCompletions()
    {
        /** @var \WP\McpSchema\Record\JSONObject|\stdClass|null $value */
        $value = $this->declaredValue('completions');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getExperimental(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('experimental');

        return $value;
    }

    /**
     * Declared in: 2026-07-28.
     *
     * @return \stdClass|null
     */
    public function getExtensions(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('extensions');

        return $value;
    }

    /**
     * @return \WP\McpSchema\Record\JSONObject|\stdClass|null
     */
    public function getLogging()
    {
        /** @var \WP\McpSchema\Record\JSONObject|\stdClass|null $value */
        $value = $this->declaredValue('logging');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getPrompts(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('prompts');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getResources(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('resources');

        return $value;
    }

    /**
     * Declared in: 2025-11-25.
     *
     * @return \stdClass|null
     */
    public function getTasks(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('tasks');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getTools(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('tools');

        return $value;
    }
}
