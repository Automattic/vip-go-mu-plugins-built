# Create a Shopify remote data block

This tutorial will walk you through connecting a [Shopify](https://www.shopify.com/) data source and how to use the automatically created block in the WordPress editor.

## Shopify API Access

To use the Shopify data source, you need to have an access token. You can create one by following these steps:

1. Login to your Shopify admin account.
2. Click "Apps" in the left sidebar.
3. Click "Apps and sales channels" in the dropdown menu.
4. Click "Develop apps".
5. Click "Create an app".
6. Give the app a name and click "Create app".
7. Give the app `unauthenticated_read_product_listings` permissions and click "Install".
8. Copy the access token from the "API Credentials" section.

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Shopify" from the dropdown menu as the data source type.
4. Name the data source. This name is only used for display purposes.
5. Enter the subdomain of your Shopify store. To find this, log into Shopify, the subdomain of your store is the portion of the URL before `myshopify.com`.
6. Enter your access token.

If the credentials are correct, you can save the data source. If you receive an error, check the token and try again.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four.

![How inserting a Shopify block looks in the WordPress Editor](https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/docs/tutorials/insert-shopify-block.gif)

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Shopify integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.

This [working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/shopify/product) will replicate what we've done in this tutorial.
