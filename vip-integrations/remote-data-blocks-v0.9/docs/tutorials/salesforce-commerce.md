# Create a Salesforce Commerce D2C remote data block

This tutorial will walk you through connecting a [Salesforce Commerce D2C](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide) data source and how to use the automatically created block in the WordPress editor.

## Salesforce Commerce D2C API Access

We have provided a pre-configured Bruno Collection for interacting with the Salesforce Commerce D2C APIs. These are located [here](../bruno-collections/Salesforce D2C APIs.json). These can be imported into the [Bruno API Client](https://www.usebruno.com/docs/api-client/introduction) to interact with the APIs.

In order to use the collection, you will need to provide the following variables:

- `salesforce domain`
- `client_id`
- `client_secret`

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Salesforce Commerce D2C" from the dropdown menu as the data source type.
4. Name the data source. This name is only used for display purposes.
5. Provide the Salesforce Commerce domain.
6. Provide the client ID and the client secret. Ensure these are correct or else authentication will fail.
7. Click Continue.
8. The stores for the provided domain will be listed. Select the store you wish to use.
9. Click Continue.
10. If you wish to have the blocks automatically be registered, ensure the `Auto-generate blocks` checkbox is checked.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four.

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Salesforce Commerce D2C integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.
