# Create a Google Sheets remote data block

This tutorial will walk you through connecting a [Google Sheets](https://workspace.google.com/products/sheets/) data source and how to use the automatically created block in the WordPress editor.

## Google Sheets API Access

Google Sheets API access is required to connect to Google Sheets. The plugin uses a [service account](https://cloud.google.com/iam/docs/service-account-overview?hl=en) to authenticate requests to the Google Sheets API. The following steps are required to set up Google Sheets API access:

- [Create a project](https://developers.google.com/workspace/guides/create-project) in Google Cloud Platform. `resourcemanager.projects.create` permission is needed to create a new project. You can skip this step if you already have a project available in your organization via the Google Cloud Platform.
- Enable the Google [Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com) and [Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) (required for listing spreadsheets) for your project. You can access these from the links above or by clicking "Enabled APIs & services" in the left-hand menu and then "+ ENABLE APIS AND SERVICES" at the top center of the screen.
- [Create a service account](https://cloud.google.com/iam/docs/service-accounts-create), which will be used to authenticate the requests to the Google Sheets API. You will need to enable the IAM API first, and then if you scroll down further on the page linked above, you can click the button to "Go to Create service account."
- Select the "Owner" role and note the service account email address.
- You will need to create the JSON key for this account. You can access the key by clicking on the three dots under Actions in the Service account table and choosing "Manage Keys."
  ![Screenshot showing a portion of the Google Console](https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/docs/tutorials/google-console.png)
- Click on "Add Key" and choose the JSON type. The file will be automatically downloaded. Keep this file safe, as it will be used to authenticate the block.
- Grant access to the service account email to the Google Sheet. The service account will authenticate the requests to the Google Sheets API for the given sheet.

## Setting up the Google Sheet

- Identify the Google Sheet that you want to connect to.
- Share the Google Sheet with the service account email address you noted above. Viewer access is sufficient.
- Note down the Google Sheet ID from the URL. For example, in the URL `https://docs.google.com/spreadsheets/d/test_spreadsheet_id/edit?gid=0#gid=0`, the Google Sheet ID is `test_spreadsheet_id`. The Google Sheet ID is the unique identifier for the Google Sheet.

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Google Sheets" from the dropdown menu as the data source type.
4. Name this data source (this name is only used internally).
5. Enter the contents of the JSON file you downloaded.

If the credentials are correct, you will be able to proceed to the other steps. If you receive an error, check the token and try again.

6. Select your desired spreadsheet and sheets.
7. Save the data source and return the data source list.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four. You will notice both a loop and a single block are available.

The loop block will return all the entries in the spreadsheet.

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Google Sheets integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.

This [working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/google-sheets/westeros-houses) will replicate what we've done in this tutorial.
