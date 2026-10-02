<?php

/**
 * This file is generated. Do not edit it directly.
 */

declare(strict_types=1);

namespace WP\McpSchema\Record;

final class SubscriptionFilter extends \WP\McpSchema\Record
{
    public const DEFINITION = 'SubscriptionFilter';

    /**
     * @return bool|null
     */
    public function getPromptsListChanged(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('promptsListChanged');

        return $value;
    }

    /**
     * @return bool|null
     */
    public function getResourcesListChanged(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('resourcesListChanged');

        return $value;
    }

    /**
     * @return array<int, string>|null
     */
    public function getResourceSubscriptions(): ?array
    {
        /** @var array<int, string>|null $value */
        $value = $this->declaredValue('resourceSubscriptions');

        return $value;
    }

    /**
     * @return bool|null
     */
    public function getToolsListChanged(): ?bool
    {
        /** @var bool|null $value */
        $value = $this->declaredValue('toolsListChanged');

        return $value;
    }
}
