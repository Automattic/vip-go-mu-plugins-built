# Troubleshooting and debugging

This plugin provides a [local development environment](local-development.md) with built-in debugging tools.

## Query monitor

When the [Query Monitor plugin](https://wordpress.org/plugins/query-monitor/) is installed and activated, Remote Data Blocks will output debugging information to the Query Monitor "Logs" panel, including error details, stack traces, query execution details, and cache hit/miss status.

> [!TIP]
> By default, the block editor is rendered in "Fullscreen mode" which hides the Admin Bar and Query Monitor. Open the three-dot menu in the top-right corner and toggle off "Fullscreen mode", or press `⇧⌥⌘F`.

The provided local development environment includes Query Monitor by default. You can also install it in non-local environments, but be aware that it may expose sensitive information in production environments.

## Debugging

The [local development environment](local-development.md) includes Xdebug for debugging PHP code and a Node.js debugging port for debugging block editor scripts.

## Resetting config

If you need to reset the Remote Data Blocks configuration in your local development environment, you can use WP-CLI to delete the configuration option. This will permanently delete all configuration values, including access tokens and API keys.

```sh
npm run wp-cli option delete remote_data_blocks_config
```
