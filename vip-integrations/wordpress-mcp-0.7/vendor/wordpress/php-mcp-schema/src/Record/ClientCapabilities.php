<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class ClientCapabilities extends \WP\McpSchema\Record
{
    public const DEFINITION = 'ClientCapabilities';

    /**
     * @return \stdClass|null
     */
    public function getElicitation(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('elicitation');

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
     * @return \stdClass|null
     */
    public function getRoots(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('roots');

        return $value;
    }

    /**
     * @return \stdClass|null
     */
    public function getSampling(): ?\stdClass
    {
        /** @var \stdClass|null $value */
        $value = $this->declaredValue('sampling');

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
}
