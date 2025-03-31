# Query `output_schema` property

The `output_schema` property is where your data shape definition happens. It should be created with care and requires updates whenever the incoming response changes.

Unless your API returns a single value, `type` will be constructed of an associative array of nested output schemas that eventually resolve to one of the accepted primitive types:

- `boolean`
- `button_url`
- `email_address`
- `html`
- `id`
- `image_alt`
- `image_url`
- `integer`
- `markdown`
- `null`
- `number`
- `string`
- `url`
- `uuid`

## Single Entry Example

Using the [Zip Code example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/zip-code/README.md), the JSON response returned by the API looks like this:

```json
{
	"post code": "17057",
	"country": "United States",
	"country abbreviation": "US",
	"places": [
		{
			"place name": "Middletown",
			"longitude": "-76.7331",
			"state": "Pennsylvania",
			"state abbreviation": "PA",
			"latitude": "40.2041"
		}
	]
}
```

And the `output_schema` definiton would look like this.

```php
'output_schema' => [
	'is_collection' => false,
	'type' => [
		'zip_code' => [
			'name' => 'Zip Code',
			'path' => '$["post code"]',
			'type' => 'string',
		],
		'city_state' => [
			'name' => 'City, State',
			'default_value' => 'Unknown',
			'generate' => function( array $response_data ): string {
				return $response_data['places'][0]['place name'] . ', ' . $response_data['places'][0]['state'];
			},
			'type' => 'string',
		],
	],
],
```

You can see how the `type` property contains a nested output schema. The `zip_code` array index starts a new definiton using `path` to find the specific value.

Where `city_state` uses the genrate function to combine two elements from inside the response. In this case we assume that the first returned place is accurate for the zip. This is a safe assumption for U.S. zip codes.

## Collection Example

An example of collection JSON can be found in the [Chicago Institue of Art example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/art-institute/README.md). That API returns (in part):

```json
{
	"preference": null,
	"pagination": {
		"total": 183,
		"limit": 10,
		"offset": 0,
		"total_pages": 19,
		"current_page": 1
	},
	"data": [
		{
			"_score": 155.49371,
			"thumbnail": {
				"alt_text": "Color pastel drawing of ballerinas in tutus on stage, watched by audience.",
				"width": 3000,
				"lqip": "data:image/gif;base64,R0lGODlhCgAFAPUAADtMRVJPRFlOQlBNSFFNSEVURU1USldSS1dSTVRXTV9ZTldVUl1ZU2hbTVdkU19kVV5tX2FkUGFjVWVoVGhoVGZhW29lXGVtXG1rWmlpXW5tXmZxX3VxX1toZG5oYG5uZ3ZsY3BqZGN1a3RxYnFyZXRxZntxan19bnl9cnh7dX57doJ/dpGEeJKOhaCUjKebk6yflsGupQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAKAAUAAAYuQIjoQuGQTqhOyrEZYSQJA6AweURYrxIoxAhoMp9VywWLmRYqj6BxQFQshIEiCAA7",
				"height": 1502
			},
			"api_model": "artworks",
			"is_boosted": true,
			"api_link": "https://api.artic.edu/api/v1/artworks/61603",
			"id": 61603,
			"title": "Ballet at the Paris Opéra",
			"timestamp": "2025-01-14T22:26:21-06:00"
		},
		{
			"_score": 152.35487,
			"thumbnail": {
				"alt_text": "Impressionist painting of woman wearing green dress trying on hats.",
				"width": 5003,
				"lqip": "data:image/gif;base64,R0lGODlhBgAFAPQAAEMtIk40KE83KlhHLVxELlNPN1hLMVJOP19UN1dYM1lUOVpUP2dAIWlKKHZKKXZLKWRNPGpbMGpaNGtaOkxUTF9dRlJaS15YSV5kUnZpRH12W4ZkM49uRI52VQAAAAAAACH5BAAAAAAALAAAAAAGAAUAAAUY4AUtFWZxHZIdExFEybAJQGE00sNQmqOEADs=",
				"height": 4543
			},
			"api_model": "artworks",
			"is_boosted": true,
			"api_link": "https://api.artic.edu/api/v1/artworks/14572",
			"id": 14572,
			"title": "The Millinery Shop",
			"timestamp": "2025-01-14T23:26:12-06:00"
		}
	],
	"info": {
		"license_text": "The `description` field in this response is licensed under a Creative Commons Attribution 4.0 Generic License (CC-By) and the Terms and Conditions of artic.edu. All other data in this response is licensed under a Creative Commons Zero (CC0) 1.0 designation and the Terms and Conditions of artic.edu.",
		"license_links": [
			"https://creativecommons.org/publicdomain/zero/1.0/",
			"https://www.artic.edu/terms"
		],
		"version": "1.10"
	},
	"config": {
		"iiif_url": "https://www.artic.edu/iiif/2",
		"website_url": "http://www.artic.edu"
	}
}
```

And the output schema is defined as:

```php
'output_schema' => [
	'is_collection' => true,
	'path' => '$.data[*]',
	'type' => [
		'id' => [
			'name' => 'Art ID',
			'type' => 'id',
		],
		'title' => [
			'name' => 'Title',
			'type' => 'string',
		],
	],
],
```

Here we can see at the top level a `path` variable is defined explictly as an array and we are capturing all elements `[*]`. From there the output variables used for each entry are named to match the property names in the JSON. This is a shortcut. This output schemea would also work:

```php
'output_schema' => [
	'is_collection' => true,
	'path' => '$.data[*]',
	'type' => [
		'id' => [
			'name' => 'Art ID',
			'type' => 'id',
		],
		'name' => [
			'path' => '$.title',
			'name' => 'Title',
			'type' => 'string',
		],
	],
],
```

If we wanted to go further and pull out more data from each item, the schema could look like:

```php
'output_schema' => [
	'is_collection' => true,
	'path' => '$.data[*]',
	'type' => [
		'id' => [
			'name' => 'Art ID',
			'type' => 'id',
		],
		'name' => [
			'path' => '$.title',
			'name' => 'Title',
			'type' => 'string',
		],
		'description' => [
			'path' => '$.thumbnail.alt_text',
			'name' => 'Description',
			'type' => 'string',
		],
		'dimensions' => [
			'generate' => function( array $response_data ): string {
				return $response_data['thumbnail']['width'] . '×' . $response_data['thumbnail']['height'];
			},
			'name' => 'Demensions (px)',
			'type' => 'string',
		],

	],
],
```

In this example you can see that `$` in the path is redfined to be the specifc entry in the collection. Similarly the `$response_data` variable contains just this single entry.
