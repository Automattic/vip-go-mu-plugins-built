# Field shortcodes

One of the current limitations of the [block bindings API](./block-bindings.md) is that it is restricted to a small number of core blocks and attributes. For example, currently, you cannot bind to the content of a table block or a custom block. You also cannot bind to a _subset_ of a block's content.

As a partial workaround, this plugin provides a way to use remote data in some places where block bindings are not supported. We call this feature "field shortcodes," and it is available in any block that uses [rich text](https://developer.wordpress.org/block-editor/reference-guides/richtext/), such as tables, lists, and custom blocks. Look for the field shortcode button in the rich text formatting toolbar:

<img width="535" alt="Field shortcode button" src="https://github.com/user-attachments/assets/8ce0bd18-367e-46d5-a870-22819c42ff4a" />

Clicking this button will open a modal that allows you to select a field from a remote data source, resulting in an inline remote data binding. Just like remote data blocks, this binding will load the latest data from the remote source when the content is rendered.

<img width="684" alt="A bulleted list using several field shortcodes to describe three conference events" src="https://github.com/user-attachments/assets/6527dcc0-c0ed-42ab-9655-b8fc2510e15b" />

Field shortcodes compile to HTML, so they are portable, safe, and have a built-in fallback.
