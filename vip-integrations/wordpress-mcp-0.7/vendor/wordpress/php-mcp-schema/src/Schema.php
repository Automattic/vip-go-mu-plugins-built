<?php

declare(strict_types=1);

namespace WP\McpSchema;

use WP\McpSchema\Exception\UnavailableTypeException;
use WP\McpSchema\Internal\JsonDecoder;
use WP\McpSchema\Internal\SchemaInterpreter;
use WP\McpSchema\Internal\TypeRegistry;

/**
 * One immutable, exact MCP revision schema.
 */
final class Schema
{
    /** @var string */
    private $version;

    /** @var array<string, array<string, mixed>> */
    private $definitions;

    /**
     * @var array{
     *   clientToServer: array{requests: array<string, string>, notifications: array<string, string>},
     *   serverToClient: array{requests: array<string, string>, notifications: array<string, string>},
     *   embeddedInputs: array<string, string>
     * }
     */
    private $messageAvailability;

    /** @var array<string, array{definition: string, versions: array<int, string>}> */
    private $records;

    /** @var array<string, array{definition: string, versions: array<int, string>}> */
    private $contracts;

    /** @var SchemaInterpreter */
    private $interpreter;

    /**
     * @param array<string, mixed> $document
     * @param array{
     *   clientToServer: array{requests: array<string, string>, notifications: array<string, string>},
     *   serverToClient: array{requests: array<string, string>, notifications: array<string, string>},
     *   embeddedInputs: array<string, string>
     * } $messageAvailability
     */
    private function __construct(string $version, array $document, array $messageAvailability)
    {
        if (! isset($document['$defs']) || ! is_array($document['$defs'])) {
            throw new \LogicException(sprintf('Catalog %s has no definitions.', $version));
        }
        $this->version             = $version;
        $this->definitions         = $document['$defs'];
        $this->messageAvailability = $messageAvailability;
        $this->records             = TypeRegistry::records();
        $this->contracts           = TypeRegistry::contracts();
        $this->interpreter         = new SchemaInterpreter($this->definitions, $version, $this->records);
    }

    public function version(): string
    {
        return $this->version;
    }

    /**
     * @template T of object
     * @param class-string<T>        $rootClass
     * @param array<array-key, mixed> $value
     * @return T
     */
    public function fromArray(string $rootClass, array $value)
    {
        return $this->hydrate($rootClass, $value, true);
    }

    /**
     * @template T of object
     * @param class-string<T> $rootClass
     * @param mixed           $value
     * @return T
     */
    public function fromValue(string $rootClass, $value)
    {
        return $this->hydrate($rootClass, $value, false);
    }

    /**
     * @template T of object
     * @param class-string<T> $rootClass
     * @return T
     */
    public function fromJson(string $rootClass, string $json)
    {
        return $this->hydrate($rootClass, (new JsonDecoder())->decode($json), false);
    }

    public function allowsClientRequest(string $method): bool
    {
        return isset($this->messageAvailability['clientToServer']['requests'][$method]);
    }

    public function allowsClientNotification(string $method): bool
    {
        return isset($this->messageAvailability['clientToServer']['notifications'][$method]);
    }

    public function allowsServerRequest(string $method): bool
    {
        return isset($this->messageAvailability['serverToClient']['requests'][$method]);
    }

    public function allowsServerNotification(string $method): bool
    {
        return isset($this->messageAvailability['serverToClient']['notifications'][$method]);
    }

    public function allowsEmbeddedInput(string $method): bool
    {
        return isset($this->messageAvailability['embeddedInputs'][$method]);
    }

    /**
     * @template T of object
     * @param class-string<T> $rootClass
     * @param mixed           $value
     * @return T
     */
    private function hydrate(string $rootClass, $value, bool $programmaticArrays)
    {
        $metadata = $this->records[$rootClass] ?? $this->contracts[$rootClass] ?? null;
        if ($metadata === null) {
            throw UnavailableTypeException::unsupportedRoot($rootClass);
        }
        if (! in_array($this->version, $metadata['versions'], true)) {
            throw UnavailableTypeException::forRevision($rootClass, $this->version);
        }

        /** @var T $record */
        $record = $this->interpreter->hydrate(
            $metadata['definition'],
            $rootClass,
            $value,
            $programmaticArrays
        );

        return $record;
    }
}
