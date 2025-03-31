# Core concepts

Remote Data Blocks allows you to integrate remote data into posts, pages, patterns, or anywhere else on your site where you use the block editor. This guide will help you understand the core concepts of the plugin and how they work.

## Supported use cases

Like WordPress, Remote Data Blocks is flexible. It can be used to enable advanced integrations with external data.

Below, you'll find specific use cases where Remote Data Blocks shines. We are working to expand these use cases, but before you start, consider if Remote Data Blocks is the right tool for the job.

### Remote Data Blocks is a good fit if:

- Your remote data represents entities with a consistent schema.
  - **Example:** Product data representing items of clothing with defined attributes like “Name,” “Price,” “Color,” “Size,” etc.
- You want humans to select specific entities for display within the block editor.
  - **Example:** Select and display an item of clothing within a marketing post.
- You want to display arbitrary remote data based on a URL parameter and are willing to write a small amount of code.
  - **Example:** Create a page and rewrite rule for /products/{product_id}/ and configure a Remote Data Block on that page to display the referenced product.
- Your presentation of remote data aligns with the capabilities of Block Bindings.
  - **Example:** Display an item of clothing using a core paragraph, heading, image, and button blocks.
- You do not require complex filtering.
  - **Example:** To select an item of clothing, load a list of top-selling products or search all products by a specific term.
- Your data is denormalized and relatively flat.
  - **Example:** A row from a Google Sheet with no references to external entities.

### Remote Data Blocks may not be a good fit if:

- Your remote data is schema-less, or the schema changes over time.
  - Queries for remote data must define a schema for their return data. Schema changes result in broken blocks.
- You want to display remote data outside the context of the block editor.
  - Block bindings are only available in block content—posts, pages, or full-site editing. Using our plugin may still provide some benefit (e.g., caching) but could require significant custom PHP code.
- Your data is normalized (and cannot be denormalized automatically by your API).
  - Some APIs can denormalize data by automatically “inflating” referenced records for you. For example, data representing an item of clothing might reference a color by ID instead of a renderable string like “forest green.” If your API does not denormalize this relationship automatically, you will need to write custom code to perform additional queries and stitch the responses together.
  - This can lead to a large number of API requests that your API may not tolerate. Airtable’s API, for example, imposes a rate limit of five requests per second, making multiple calls impractical.
- You have multiple remote data sources that require interaction. Or, you want to implement a complex content architecture using Remote Data Blocks instead of leveraging WordPress custom post types and/or taxonomies.
  - These two challenges are directly related to the issues with normalized data. If you have data sources that relate to one another, you have to write custom code to query missing data and stitch them together.
  - Judging complexity is difficult, but implementing large applications using Remote Data Blocks is not advisable.
- You require complex filtering or have complex pagination needs.
  - Our UI components for filtering are pagination still under development.

Over time, Remote Data Blocks will grow and improve and these guidelines will change.

## Remote data source

**Remote data source** refers to data that is fetched from an external source, such as an API or a third-party service. This might be a product in your Shopify store, data in an Airtable or Google Sheet, or a file in a GitHub repository. Remote data is usually fetched via HTTP requests, but you can [extend the plugin](../extending/index.md) to support other transports.

Simple data sources can be configured via the plugin's settings screen, while others may require custom PHP code (see [extending](../extending/index.md)).

## Queries

**Queries** define how data is fetched, processed, and displayed. Queries delegate some logic to a **data source**, which can be reused by multiple queries. For example, one query to retrieve a single item, and one to retrieve a list.

Simple queries can be configured via the plugin's settings screen, while others may require custom PHP code (see [extending](../extending/index.md)).

## Remote data block

A **remote data block** is a custom block connected to a specific query. Each remote data block has a unique name and is strictly tied to a data source.

For example, you might have a remote data block named "Shopify Product" that fetches a product from your Shopify store and displays the product's name, description, price, and image. Or, you might have a remote data block named "Conference event" that displays rows from an Airtable and displays the event's name, location, and type.

Remote data blocks are **container blocks** that contain other blocks and provide remote data to them. You retain complete control over the layout, design, and content. You can leverage patterns to enable consistent styling and customize the block's appearance using the block editor or `theme.json`.

Remote data blocks are custom blocks, but they are created and registered by our plugin and don't require custom block development. Remote data is loaded via [the block bindings API](./block-bindings.md) or [field shortcodes](./field-shortcodes.md).

## Data fetching

The plugin handles data fetching and wraps [`wp_remote_request`](https://developer.wordpress.org/reference/functions/wp_remote_request/).

When a request to your site renders one or more remote data blocks, our plugin will fetch and potentially cache the remote data. Multiple requests for the same data within a single page load will be deduped, even if the requests are not cacheable.

### Caching

The plugin offers a caching layer for optimal performance and helps avoid rate limiting from remote data sources. It will be used if your WordPress environment configures a [persistent object cache](https://developer.wordpress.org/reference/classes/wp_object_cache/#persistent-cache-plugins). Otherwise, the plugin will utilize in-memory (per-page-load) caching. Deploying to production without a persistent object cache is not recommended.

The default TTL for all cache objects is 60 seconds, but it can be [configured per query or request](../extending/query.md#get_cache_ttl).

## Theming

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Patterns

Since remote data blocks are container blocks, you can associate a remote data block with a pattern to create reusable layouts. You link a pattern to a particular remote data block in the Site Editor. You will see a new Remote Data Blocks section in the right-hand panel when editing a pattern.

![Screenshot showing the right hand panel of the WordPress Site Editor](https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/docs/concepts/patterns-right-panel.png)

Select the specific block that is appropriate for this pattern. Once saved, content creators can select this pattern when adding the associated remote data block.

You can also create a pattern directly from the content.
<video src="https://github.com/user-attachments/assets/358d9d40-557b-4f39-b943-ed73d6f18adb"></video>

The plugin supports both synced and unsynced patterns.

## Technical concepts

If you want to understand the internals of Remote Data Blocks so that you can extend its functionality, head over to the [extending guide](../extending/index.md).
