<?php

declare(strict_types=1);

namespace WP\McpSchema;

use WP\McpSchema\Exception\UnsupportedRevisionException;
use WP\McpSchema\Internal\Catalog\V2025_11_25;
use WP\McpSchema\Internal\Catalog\V2026_07_28;

/**
 * Lazy provider for supported exact MCP revisions.
 */
final class Schemas
{
    public const V2025_11_25 = '2025-11-25';
    public const V2026_07_28 = '2026-07-28';

    /** @var array<string, Schema> */
    private $schemas = array();

    /** @var \Closure */
    private $schemaFactory;

    private function __construct()
    {
        $factory = \Closure::bind(
            /**
             * @param array<string, mixed> $document
             * @param array{
             *   clientToServer: array{requests: array<string, string>, notifications: array<string, string>},
             *   serverToClient: array{requests: array<string, string>, notifications: array<string, string>},
             *   embeddedInputs: array<string, string>
             * } $messageAvailability
            */
            static function (string $version, array $document, array $messageAvailability): Schema {
                /**
                 * @var array{
                 *   clientToServer: array{requests: array<string, string>, notifications: array<string, string>},
                 *   serverToClient: array{requests: array<string, string>, notifications: array<string, string>},
                 *   embeddedInputs: array<string, string>
                 * } $messageAvailability
                 */
                return new Schema($version, $document, $messageAvailability);
            },
            null,
            Schema::class
        );
        if (! $factory instanceof \Closure) {
            throw new \LogicException('Unable to bind the private schema factory.');
        }
        $this->schemaFactory = $factory;
    }

    public static function create(): self
    {
        return new self();
    }

    public function forVersion(string $version): Schema
    {
        if (isset($this->schemas[$version])) {
            return $this->schemas[$version];
        }
        if ($version === self::V2025_11_25) {
            /** @var Schema $schema */
            $schema = ($this->schemaFactory)(
                $version,
                V2025_11_25::document(),
                V2025_11_25::messageAvailability()
            );
        } elseif ($version === self::V2026_07_28) {
            /** @var Schema $schema */
            $schema = ($this->schemaFactory)(
                $version,
                V2026_07_28::document(),
                V2026_07_28::messageAvailability()
            );
        } else {
            throw UnsupportedRevisionException::forRevision($version, self::supportedVersions());
        }
        $this->schemas[$version] = $schema;

        return $schema;
    }

    /**
     * @return array<int, string>
     */
    public static function supportedVersions(): array
    {
        return array(self::V2025_11_25, self::V2026_07_28);
    }
}
