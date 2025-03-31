# Extending

> [!TIP]
> Make sure you've read the [core concepts](../concepts/index.md) behind Remote Data Blocks before extending the plugin.

Data sources and queries can be configured in the plugin UI, but sometimes, you need to extend the plugin to implement custom functionality. Remote Data Blocks provides extendable classes, global functions, hooks, and filters to help you connect to any data source, parse responses, and customize the display of data.

## Data Flow

Here's a short overview of how data flows through the plugin when a post with a remote data block is rendered:

1. WordPress core loads the post content, parses the blocks, and recognizes that a paragraph block has a [block binding](../concepts/block-bindings.md).
2. WordPress core calls the block binding callback function: `BlockBindings::get_value()`.
3. The callback function inspects the paragraph block. Using the block context supplied by the parent remote data block, it determines which [query](./query.md) to execute.
4. The query is executed: `$query->execute()` (usually by delegating to a [query runner](./query-runner.md)).
5. Various properties of the query are requested by the query runner, including the endpoint, request headers, request method, and request body. Some of these properties are delegated to the data source (`$query->get_data_source()`).
6. The query is dispatched, and the response data is inspected, formatted into a consistent shape, and returned to the block binding callback function.
7. The callback function extracts the requested field from the response data and returns it to WordPress core for rendering.

## Customization

Providing a custom data source, query, or query runner gives you complete control over how data is fetched, processed, and rendered. In most cases, you only need to extend one of these classes to implement custom behavior. A common approach is to define a data source on the settings screen and then commit a custom query in code to fetch and process the data.

Here are some detailed overviews of these classes with notes on how and why to extend them:

- [Data Source](data-source.md)
- [Query](query.md)

Once you've defined your data source and queries, you can [register a remote data block](block-registration.md) that uses them. That block can use a [pattern](block-patterns.md) for display. You can also use [overrides](./overrides.md) to dynamically select the displayed content.

### Additional customization

- [Hooks (actions and filters)](hooks.md)
- [Query runner](query-runner.md)

## Examples

The [examples](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/README.md) provide detailed code samples of interacting with the plugin various methods of extending the plugin.

## Create a local development environment

This repository includes tools for quickly starting a [local development environment](../local-development.md).
