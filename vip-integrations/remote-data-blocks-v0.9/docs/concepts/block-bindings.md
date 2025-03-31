# Block bindings

Remote Data Blocks takes advantage of the [Block Bindings API](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/). This Core WordPress API allows you to “bind” dynamic data to the block's attributes, which are then reflected in the final HTML markup.

The Block Bindings API allows Remote Data Blocks to read from different sources without needing to write custom block boilerplate, React, block registration, and other particulars of writing custom blocks from scratch for each new data source.

For a quick overview, the [announcement post](https://make.wordpress.org/core/2024/03/06/new-feature-the-block-bindings-api/) is very helpful. The Block Bindings API is evolving, and an in-depth understanding isn't necessary for day-to-day use.

But if you want to dig deeper into the internals of how Remote Data Blocks works, the [public documentation](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/) is available.
