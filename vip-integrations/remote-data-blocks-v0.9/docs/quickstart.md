# Quickstart

The easiest way to see Remote Data Blocks in action is to launch the plugin in WordPress Playground.

[![Launch in WordPress Playground](https://img.shields.io/badge/Launch%20in%20WordPress%20Playground-DA9A45?style=for-the-badge&logo=wordpress)](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/blueprint.json)

However, the more advanced use case is providing your own custom configuration through code. This guide will walk you through the steps to do this.

## Step 1: Install the plugin

Download [the latest release of the plugin](https://github.com/Automattic/remote-data-blocks/releases/latest/download/remote-data-blocks.zip), unzip, and add it to the `plugins/` directory of your WordPress site.

## Step 2: Create a data source

In the WordPress admin, go to **Settings** > **Remote Data Blocks** and click **Connect new**. Give the data source a display name and enter `https://api.zippopotam.us/us/` as the URL. Save the data source.

Back on the data source list, click the three dots on the right of the row for your new data source and copy the UUID.

## Step 3: Copy the zip code data source example

Copy the [zip code data source example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/zip-code/zip-code.php) into your `/plugins` directory, set `EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID` to the UUID copied above and then activate the plugin titled `Zip Code RDB Example`.

## Step 4: Customize the configuration

Try making changes to the configuration. For example, rename the block in the `register_remote_data_block` function call.

## Step 5: Test the block

Go to the page where you want to use the block and add the block to the page. Click `Provide manual input`, enter a US ZIP code and then hit save. Then, choose a pattern to use to display the data on the page.
