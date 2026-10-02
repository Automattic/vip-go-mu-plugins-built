<?php

declare(strict_types=1);

namespace WP\McpSchema\Internal;

use WP\McpSchema\Exception\ValidationException;
use WP\McpSchema\Record;

/**
 * Bounded interpreter for the JSON Schema vocabulary used by supported MCP revisions.
 *
 * @internal
 */
final class SchemaInterpreter
{
    /** @var array<string, array<string, mixed>> */
    private $definitions;

    /** @var array<string, array{definition: string, versions: array<int, string>}> */
    private $records;

    /** @var array<string, class-string<Record>> */
    private $recordClassesByDefinition = array();

    /**
     * @var array<string, array{
     *   properties: array<string, array<string, mixed>>,
     *   required: array<string, true>,
     *   additional: mixed,
     *   additionalSpecified: bool
     * }>
     */
    private $objectShapesByDefinition = array();

    /** @var \Closure */
    private $recordFactory;

    /**
     * @param array<string, array<string, mixed>> $definitions
     * @param array<string, array{definition: string, versions: array<int, string>}> $records
     */
    public function __construct(array $definitions, string $revision, array $records)
    {
        $this->definitions = $definitions;
        $this->records     = $records;
        foreach ($records as $class => $metadata) {
            if (! in_array($revision, $metadata['versions'], true)) {
                continue;
            }
            if (isset($this->recordClassesByDefinition[$metadata['definition']])) {
                throw new \LogicException(sprintf(
                    'Revision %s maps definition %s to more than one record class.',
                    $revision,
                    $metadata['definition']
                ));
            }
            /** @var class-string<Record> $class */
            $this->recordClassesByDefinition[$metadata['definition']] = $class;
        }

        $factory = \Closure::bind(
            /**
             * @param class-string<Record> $class
             * @param array<string, mixed> $values
             * @param array<int, string>   $declaredFields
             */
            static function (string $class, array $values, array $declaredFields): Record {
                /** @var Record $record */
                $record = new $class($values, $declaredFields);

                return $record;
            },
            null,
            Record::class
        );
        if (! $factory instanceof \Closure) {
            throw new \LogicException('Unable to bind the private record hydrator.');
        }
        $this->recordFactory = $factory;
    }

    /**
     * @param class-string $rootClass
     * @param mixed        $value
     * @return object
     */
    public function hydrate(string $definition, string $rootClass, $value, bool $programmaticArrays)
    {
        $normalizer = new InputNormalizer($programmaticArrays);
        $normalized = $normalizer->normalize($value);
        $result     = $this->evaluateDefinition($definition, $normalized, '', 0, $rootClass, $programmaticArrays);
        if (! is_object($result) || ! $result instanceof $rootClass) {
            throw new \LogicException(sprintf('Hydrated %s does not implement requested root %s.', $definition, $rootClass));
        }

        return $result;
    }

    /**
     * @param mixed             $value
     * @param class-string|null $preferredClass
     * @return mixed
     */
    private function evaluateDefinition(
        string $name,
        $value,
        string $pointer,
        int $depth,
        ?string $preferredClass,
        bool $programmaticArrays
    ) {
        if (! isset($this->definitions[$name])) {
            throw new \LogicException(sprintf('Catalog reference points to unknown definition %s.', $name));
        }
        /** @var class-string<Record>|null $recordClass */
        $recordClass = $preferredClass !== null && isset($this->records[$preferredClass])
            ? $preferredClass
            : $this->recordClassForDefinition($name);
        if ($recordClass !== null) {
            return $this->evaluateObject(
                $this->objectShapeForDefinition($name),
                $value,
                $pointer,
                $depth,
                $recordClass,
                $programmaticArrays
            );
        }

        return $this->evaluateSchema(
            $this->definitions[$name],
            $value,
            $pointer,
            $depth,
            $programmaticArrays
        );
    }

    /**
     * @param array<string, mixed> $schema
     * @param mixed                $value
     * @return mixed
     */
    private function evaluateSchema(
        array $schema,
        $value,
        string $pointer,
        int $depth,
        bool $programmaticArrays
    ) {
        if ($depth > InputNormalizer::MAX_DEPTH) {
            throw new ValidationException($pointer, 'Schema evaluation exceeds the maximum nesting depth.');
        }

        if (isset($schema['$ref'])) {
            /** @var string $reference */
            $reference = $schema['$ref'];
            $name   = $this->referenceName($reference);
            $result = $this->evaluateDefinition($name, $value, $pointer, $depth, null, $programmaticArrays);
            $siblings = array_diff_key($schema, array('$ref' => true, 'description' => true));
            if ($siblings !== array()) {
                $this->evaluateSchema($siblings, $value, $pointer, $depth, $programmaticArrays);
            }

            return $result;
        }

        if (isset($schema['anyOf'])) {
            /** @var array<int, array<string, mixed>> $members */
            $members = $schema['anyOf'];

            return $this->evaluateAnyOf($members, $value, $pointer, $depth, $programmaticArrays);
        }

        $nominalAllOf = $this->nominalAllOfReference($schema);
        if ($nominalAllOf !== null) {
            $result = $this->evaluateDefinition(
                $nominalAllOf['name'],
                $value,
                $pointer,
                $depth,
                null,
                $programmaticArrays
            );
            /** @var array<int, array<string, mixed>> $members */
            $members = $schema['allOf'];
            foreach ($members as $index => $member) {
                if ($index === $nominalAllOf['index']) {
                    continue;
                }
                $this->evaluateSchema($member, $value, $pointer, $depth, $programmaticArrays);
            }
            $siblings = array_diff_key($schema, array('allOf' => true, 'description' => true));
            if ($siblings !== array()) {
                $this->evaluateSchema($siblings, $value, $pointer, $depth, $programmaticArrays);
            }

            return $result;
        }

        if ($this->constrainsObject($schema, array())) {
            return $this->evaluateObject(
                $this->objectShape($schema, array()),
                $value,
                $pointer,
                $depth,
                null,
                $programmaticArrays
            );
        }

        if (isset($schema['allOf'])) {
            /** @var array<int, array<string, mixed>> $members */
            $members = $schema['allOf'];
            $result  = $this->materializeAny($value);
            foreach ($members as $member) {
                $result = $this->evaluateSchema(
                    $member,
                    $value,
                    $pointer,
                    $depth,
                    $programmaticArrays
                );
            }
            $siblings = array_diff_key($schema, array('allOf' => true, 'description' => true));
            if ($siblings !== array()) {
                $result = $this->evaluateSchema(
                    $siblings,
                    $value,
                    $pointer,
                    $depth,
                    $programmaticArrays
                );
            }

            return $result;
        }

        if (array_key_exists('const', $schema) && ! self::jsonEquals($value, $schema['const'])) {
            throw new ValidationException($pointer, sprintf('Value must equal %s.', (string) json_encode($schema['const'])));
        }
        if (isset($schema['enum'])) {
            /** @var array<int, mixed> $enum */
            $enum = $schema['enum'];
            $matched = false;
            foreach ($enum as $allowed) {
                if (self::jsonEquals($value, $allowed)) {
                    $matched = true;
                    break;
                }
            }
            if (! $matched) {
                throw new ValidationException($pointer, 'Value is not one of the allowed enum members.');
            }
        }

        if (isset($schema['type']) && ! $this->matchesType($value, $schema['type'], $programmaticArrays)) {
            /** @var string|array<int, string> $schemaType */
            $schemaType = $schema['type'];
            $expected = is_array($schemaType) ? implode('|', $schemaType) : $schemaType;
            throw new ValidationException($pointer, sprintf('Expected %s, got %s.', $expected, self::valueType($value)));
        }
        if (isset($schema['minimum'])) {
            /** @var int|float $minimum */
            $minimum = $schema['minimum'];
            if (! is_int($value) && ! is_float($value) || $value < $minimum) {
                throw new ValidationException($pointer, sprintf('Number must be at least %s.', (string) $minimum));
            }
        }
        if (isset($schema['maximum'])) {
            /** @var int|float $maximum */
            $maximum = $schema['maximum'];
            if (! is_int($value) && ! is_float($value) || $value > $maximum) {
                throw new ValidationException($pointer, sprintf('Number must be at most %s.', (string) $maximum));
            }
        }

        // A type list such as ["array", "null"] accepts non-list values that
        // matchesType() already admitted, so list rules apply to lists only.
        $types = isset($schema['type']) ? (array) $schema['type'] : array();
        if (in_array('array', $types, true) && is_array($value) && InputNormalizer::isList($value)) {
            if (isset($schema['maxItems'])) {
                /** @var int $maxItems */
                $maxItems = $schema['maxItems'];
                if (count($value) > $maxItems) {
                    throw new ValidationException($pointer, sprintf('List must contain at most %d items.', $maxItems));
                }
            }
            $output = array();
            foreach ($value as $index => $item) {
                if (isset($schema['items'])) {
                    /** @var array<string, mixed> $itemSchema */
                    $itemSchema = $schema['items'];
                    $output[] = $this->evaluateSchema(
                        $itemSchema,
                        $item,
                        InputNormalizer::appendPointer($pointer, (string) $index),
                        $depth + 1,
                        $programmaticArrays
                    );
                } else {
                    $output[] = $this->materializeAny($item);
                }
            }

            return $output;
        }

        return $this->materializeAny($value);
    }

    /**
     * @param array<int, array<string, mixed>> $members
     * @param mixed                            $value
     * @return mixed
     */
    private function evaluateAnyOf(
        array $members,
        $value,
        string $pointer,
        int $depth,
        bool $programmaticArrays
    ) {
        $fields = $this->objectFields($value, $programmaticArrays);
        if ($fields === null) {
            foreach ($members as $member) {
                try {
                    return $this->evaluateSchema($member, $value, $pointer, $depth, $programmaticArrays);
                } catch (ValidationException $exception) {
                    // Scalar unions preserve canonical first-match hydration.
                }
            }
            throw new ValidationException($pointer, 'Value does not match any allowed union member.');
        }

        $candidates = $this->flattenUnionMembers($members, array());
        $hasSuccess = false;
        $firstResult = null;
        $hasObjectResult = false;
        $bestResult = null;
        $bestCoverage = -1;
        foreach ($candidates as $member) {
            $coverage = $this->declaredKeyCoverage($member, $fields);
            try {
                $result = $this->evaluateSchema($member, $value, $pointer, $depth, $programmaticArrays);
            } catch (ValidationException $exception) {
                continue;
            }
            // Preserve an empty PHP list when a member accepts it without object conversion.
            if ($value === array() && $result === array()) {
                return $result;
            }
            if (! $hasSuccess) {
                $hasSuccess = true;
                $firstResult = $result;
            }
            if ($coverage !== null && (! $hasObjectResult || $coverage > $bestCoverage)) {
                $hasObjectResult = true;
                $bestCoverage = $coverage;
                $bestResult = $result;
            }
        }

        if ($hasObjectResult) {
            return $bestResult;
        }
        if ($hasSuccess) {
            return $firstResult;
        }

        throw new ValidationException($pointer, 'Value does not match any allowed union member.');
    }

    /**
     * @param array<int, array<string, mixed>> $members
     * @param array<int, string>               $seen
     * @return array<int, array<string, mixed>>
     */
    private function flattenUnionMembers(array $members, array $seen): array
    {
        $flattened = array();
        foreach ($members as $member) {
            $nested = null;
            $name = null;
            $siblings = array_diff_key($member, array('anyOf' => true, 'description' => true));
            if (isset($member['anyOf']) && $siblings === array()) {
                /** @var array<int, array<string, mixed>> $nested */
                $nested = $member['anyOf'];
            } elseif (isset($member['$ref'])) {
                /** @var string $reference */
                $reference = $member['$ref'];
                $name = $this->referenceName($reference);
                $target = $this->definitions[$name];
                $targetSiblings = array_diff_key($target, array('anyOf' => true, 'description' => true));
                if (isset($target['anyOf']) && $targetSiblings === array()) {
                    /** @var array<int, array<string, mixed>> $nested */
                    $nested = $target['anyOf'];
                }
            }

            if ($nested === null) {
                $flattened[] = $member;
                continue;
            }
            if ($name !== null && in_array($name, $seen, true)) {
                throw new \LogicException(sprintf('Recursive union composition at %s.', $name));
            }
            $flattened = array_merge(
                $flattened,
                $this->flattenUnionMembers(
                    $nested,
                    $name === null ? $seen : array_merge($seen, array($name))
                )
            );
        }

        return $flattened;
    }

    /**
     * @param array<string, mixed> $member
     * @param array<string, mixed> $fields
     */
    private function declaredKeyCoverage(array $member, array $fields): ?int
    {
        if (! $this->constrainsObject($member, array())) {
            return null;
        }
        $properties = $this->objectShape($member, array())['properties'];
        $coverage = 0;
        foreach ($fields as $field => $_value) {
            if (array_key_exists((string) $field, $properties)) {
                ++$coverage;
            }
        }

        return $coverage;
    }

    /**
     * @param array{properties: array<string, array<string, mixed>>, required: array<string, true>, additional: mixed} $shape
     * @param mixed $value
     * @param class-string<Record>|null $recordClass
     * @return Record|\stdClass
     */
    private function evaluateObject(
        array $shape,
        $value,
        string $pointer,
        int $depth,
        ?string $recordClass,
        bool $programmaticArrays
    ) {
        $fields = $this->objectFields($value, $programmaticArrays);
        if ($fields === null) {
            throw new ValidationException($pointer, sprintf('Expected object, got %s.', self::valueType($value)));
        }

        foreach ($shape['required'] as $field => $_required) {
            if (! array_key_exists($field, $fields)) {
                throw new ValidationException(
                    InputNormalizer::appendPointer($pointer, $field),
                    'Required field is missing.'
                );
            }
        }

        $hydrated = array();
        foreach ($fields as $field => $item) {
            $fieldPointer = InputNormalizer::appendPointer($pointer, (string) $field);
            if (isset($shape['properties'][$field])) {
                $hydrated[$field] = $this->evaluateSchema(
                    $shape['properties'][$field],
                    $item,
                    $fieldPointer,
                    $depth + 1,
                    $programmaticArrays
                );
                continue;
            }
            if ($shape['additional'] === false) {
                throw new ValidationException($fieldPointer, 'Additional field is not allowed.');
            }
            if (is_array($shape['additional']) && $shape['additional'] !== array()) {
                $hydrated[$field] = $this->evaluateSchema(
                    $shape['additional'],
                    $item,
                    $fieldPointer,
                    $depth + 1,
                    $programmaticArrays
                );
            } else {
                $hydrated[$field] = $this->materializeAny($item);
            }
        }

        $declared = array_keys($shape['properties']);
        if ($recordClass !== null) {
            /** @var Record $record */
            $record = ($this->recordFactory)($recordClass, $hydrated, $declared);

            return $record;
        }

        $output = new \stdClass();
        foreach ($hydrated as $field => $item) {
            $output->{$field} = $item;
        }

        return $output;
    }

    /**
     * @param mixed $value
     * @return array<string, mixed>|null
     */
    private function objectFields($value, bool $programmaticArrays): ?array
    {
        if ($value instanceof \stdClass) {
            /** @var array<string, mixed> $fields */
            $fields = get_object_vars($value);

            return $fields;
        }
        if (
            ! $programmaticArrays ||
            ! is_array($value) ||
            ($value !== array() && InputNormalizer::isList($value))
        ) {
            return null;
        }

        $fields = array();
        foreach ($value as $key => $item) {
            $fields[(string) $key] = $item;
        }

        return $fields;
    }

    /**
     * @param array<string, mixed> $schema
     * @param array<int, string>   $seen
     * @return array{properties: array<string, array<string, mixed>>, required: array<string, true>, additional: mixed, additionalSpecified: bool}
     */
    private function objectShape(array $schema, array $seen): array
    {
        $shape = array(
            'properties'          => array(),
            'required'            => array(),
            'additional'          => true,
            'additionalSpecified' => false,
        );
        if (isset($schema['$ref'])) {
            /** @var string $reference */
            $reference = $schema['$ref'];
            $name = $this->referenceName($reference);
            if (in_array($name, $seen, true)) {
                throw new \LogicException(sprintf('Recursive object composition at %s.', $name));
            }
            $this->mergeShape(
                $shape,
                $this->objectShapeForDefinition($name, $seen)
            );
        }
        /** @var array<int, array<string, mixed>> $allOf */
        $allOf = $schema['allOf'] ?? array();
        foreach ($allOf as $member) {
            $this->mergeShape($shape, $this->objectShape($member, $seen));
        }
        /** @var array<string, array<string, mixed>> $properties */
        $properties = $schema['properties'] ?? array();
        foreach ($properties as $field => $propertySchema) {
            if (isset($shape['properties'][$field])) {
                $shape['properties'][$field] = array(
                    'allOf' => array($shape['properties'][$field], $propertySchema),
                );
            } else {
                $shape['properties'][$field] = $propertySchema;
            }
        }
        /** @var array<int, string> $required */
        $required = $schema['required'] ?? array();
        foreach ($required as $field) {
            $shape['required'][$field] = true;
        }
        if (array_key_exists('additionalProperties', $schema)) {
            $shape['additional']          = $schema['additionalProperties'];
            $shape['additionalSpecified'] = true;
        }

        return $shape;
    }

    /**
     * @param array<int, string> $seen
     * @return array{properties: array<string, array<string, mixed>>, required: array<string, true>, additional: mixed, additionalSpecified: bool}
     */
    private function objectShapeForDefinition(string $name, array $seen = array()): array
    {
        if (isset($this->objectShapesByDefinition[$name])) {
            return $this->objectShapesByDefinition[$name];
        }
        if (! isset($this->definitions[$name])) {
            throw new \LogicException(sprintf('Catalog reference points to unknown definition %s.', $name));
        }
        if (in_array($name, $seen, true)) {
            throw new \LogicException(sprintf('Recursive object composition at %s.', $name));
        }

        $shape = $this->objectShape(
            $this->definitions[$name],
            array_merge($seen, array($name))
        );
        $this->objectShapesByDefinition[$name] = $shape;

        return $shape;
    }

    /**
     * @param array<string, mixed> $schema
     * @return array{name: string, index: int}|null
     */
    private function nominalAllOfReference(array $schema): ?array
    {
        if (! isset($schema['allOf']) || ! is_array($schema['allOf'])) {
            return null;
        }
        $references = array();
        foreach ($schema['allOf'] as $index => $member) {
            if (! isset($member['$ref'])) {
                continue;
            }
            $siblings = array_diff_key($member, array('$ref' => true, 'description' => true));
            if ($siblings === array()) {
                $references[] = array('index' => $index, 'member' => $member);
            }
        }
        if (count($references) !== 1) {
            return null;
        }

        /** @var string $reference */
        $reference = $references[0]['member']['$ref'];
        $name = $this->referenceName($reference);
        if ($this->recordClassForDefinition($name) === null) {
            return null;
        }
        $baseProperties = $this->objectShapeForDefinition($name)['properties'];
        $refinements = array();
        foreach ($schema['allOf'] as $index => $member) {
            if ($index !== $references[0]['index']) {
                $refinements[] = $member;
            }
        }
        $siblings = array_diff_key($schema, array('allOf' => true, 'description' => true));
        if ($siblings !== array()) {
            $refinements[] = $siblings;
        }

        foreach ($refinements as $refinement) {
            $shape = $this->objectShape($refinement, array());
            foreach (array_keys($shape['properties'] + $shape['required']) as $field) {
                if (! array_key_exists($field, $baseProperties)) {
                    return null;
                }
            }
        }

        return array('name' => $name, 'index' => $references[0]['index']);
    }

    /**
     * Whether a schema intersection constrains the value as an object.
     *
     * JSON Schema permits `allOf` for primitive refinements as well as object
     * composition. Only object intersections may be flattened into a property
     * shape; primitive intersections must evaluate each member independently.
     *
     * @param array<string, mixed> $schema
     * @param array<int, string>   $seen
     */
    private function constrainsObject(array $schema, array $seen): bool
    {
        if (($schema['type'] ?? null) === 'object' || isset($schema['properties'])) {
            return true;
        }
        if (isset($schema['$ref'])) {
            /** @var string $reference */
            $reference = $schema['$ref'];
            $name = $this->referenceName($reference);
            if (in_array($name, $seen, true)) {
                return false;
            }

            return $this->constrainsObject(
                $this->definitions[$name],
                array_merge($seen, array($name))
            );
        }
        /** @var array<int, array<string, mixed>> $allOf */
        $allOf = $schema['allOf'] ?? array();
        foreach ($allOf as $member) {
            if ($this->constrainsObject($member, $seen)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array{properties: array<string, array<string, mixed>>, required: array<string, true>, additional: mixed, additionalSpecified: bool} $target
     * @param array{properties: array<string, array<string, mixed>>, required: array<string, true>, additional: mixed, additionalSpecified: bool} $source
     */
    private function mergeShape(array &$target, array $source): void
    {
        foreach ($source['properties'] as $field => $schema) {
            if (isset($target['properties'][$field])) {
                $target['properties'][$field] = array(
                    'allOf' => array($target['properties'][$field], $schema),
                );
            } else {
                $target['properties'][$field] = $schema;
            }
        }
        $target['required'] += $source['required'];
        if ($source['additionalSpecified']) {
            $target['additional']          = $source['additional'];
            $target['additionalSpecified'] = true;
        }
    }

    /**
     * @param mixed $expected
     * @param mixed $value
     */
    private function matchesType($value, $expected, bool $programmaticArrays): bool
    {
        foreach ((array) $expected as $type) {
            if ($type === 'null' && $value === null) return true;
            if ($type === 'boolean' && is_bool($value)) return true;
            if ($type === 'string' && is_string($value)) return true;
            if ($type === 'number' && (is_int($value) || is_float($value))) return true;
            if (
                $type === 'integer' &&
                (
                    is_int($value) ||
                    is_float($value) &&
                    is_finite($value) &&
                    floor($value) === $value &&
                    $value >= (float) PHP_INT_MIN &&
                    $value < -((float) PHP_INT_MIN)
                )
            ) {
                return true;
            }
            if ($type === 'array' && is_array($value) && InputNormalizer::isList($value)) return true;
            if (
                $type === 'object' &&
                (
                    $value instanceof \stdClass ||
                    $programmaticArrays &&
                    is_array($value) &&
                    ($value === array() || ! InputNormalizer::isList($value))
                )
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param mixed $value
     * @return mixed
     */
    private function materializeAny($value)
    {
        if ($value instanceof \stdClass) {
            $output = new \stdClass();
            foreach (get_object_vars($value) as $key => $item) {
                $output->{$key} = $this->materializeAny($item);
            }

            return $output;
        }
        if (! is_array($value)) {
            return $value;
        }
        if (InputNormalizer::isList($value)) {
            return array_map(array($this, 'materializeAny'), $value);
        }

        $output = new \stdClass();
        foreach ($value as $key => $item) {
            $output->{(string) $key} = $this->materializeAny($item);
        }

        return $output;
    }

    private function recordClassForDefinition(string $definition): ?string
    {
        return $this->recordClassesByDefinition[$definition] ?? null;
    }

    private function referenceName(string $reference): string
    {
        if (! preg_match('/^#\/\$defs\/([A-Za-z][A-Za-z0-9]*)$/', $reference, $matches)) {
            throw new \LogicException(sprintf('Unsupported catalog reference %s.', $reference));
        }

        return $matches[1];
    }

    /**
     * @param mixed $left
     * @param mixed $right
     */
    private static function jsonEquals($left, $right): bool
    {
        if ((is_int($left) || is_float($left)) && (is_int($right) || is_float($right))) {
            return $left == $right;
        }

        return $left === $right;
    }

    /**
     * @param mixed $value
     */
    private static function valueType($value): string
    {
        if ($value instanceof \stdClass) return 'object';
        if (is_array($value)) return InputNormalizer::isList($value) ? 'array' : 'object-like PHP array';
        if (is_int($value)) return 'integer';
        if (is_float($value)) return 'number';
        if (is_bool($value)) return 'boolean';
        if ($value === null) return 'null';

        return gettype($value);
    }
}
