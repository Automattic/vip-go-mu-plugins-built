# Create an Airtable remote data block

This tutorial will walk you through connecting an [Airtable](https://airtable.com/) data source and how to use the automatically created block in the WordPress editor.

## Base and personal access token

First, identify an Airtable base and table that you want to use as a data source. This example uses a base created from the default [“Event planning” template](https://www.airtable.com/templates/event-planning/exppdJtYjEgfmd6Sq), accessible from the Airtable home screen after logging in. We will target the “Schedule” table from that base.

<p><img width="375" alt="airtable-template" src="https://github.com/user-attachments/assets/a5be04c6-d72c-4cf2-9e62-814af54f9a35"></p>

Next, [create a personal access token](https://airtable.com/create/tokens) that has the `data.records:read` and `schema.bases:read` scopes and has access to the base or bases you wish to use.

<p><img width="939" alt="create-pat" src="https://github.com/user-attachments/assets/16b43ea3-ebf9-4904-8c65-a3040de902d4"></p>

You should not commit this token directly to your code or share it publicly. The Remote Data Blocks plugin stores the token in the WordPress database.

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Airtable" from the dropdown menu as the data source type.
4. Name this data source. This name is only used for display purposes.
5. Enter the access token you created in Airtable.

If the personal access token is correct, you will be able to proceed to the other steps. If you receive an error, check the token and try again.

6. Select your desired base and tables.
7. Save the data source and return the data source list.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four.

<video src="https://github.com/user-attachments/assets/67f22710-b1bd-4f2c-a410-2e20fe27b348"></video>

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Airtable integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.

This [working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/airtable/events) will replicate what we've done in this tutorial.
