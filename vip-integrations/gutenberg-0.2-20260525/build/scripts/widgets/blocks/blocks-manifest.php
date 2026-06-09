<?php
// This file is generated. Do not modify it manually.
return array(
	'legacy-widget' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'core/legacy-widget',
		'title' => 'Legacy Widget',
		'category' => 'widgets',
		'description' => 'Display a legacy widget.',
		'textdomain' => 'default',
		'attributes' => array(
			'id' => array(
				'type' => 'string',
				'default' => null
			),
			'idBase' => array(
				'type' => 'string',
				'default' => null
			),
			'instance' => array(
				'type' => 'object',
				'default' => null
			)
		),
		'supports' => array(
			'html' => false,
			'customClassName' => false,
			'reusable' => false
		),
		'editorStyle' => 'wp-block-legacy-widget-editor'
	),
	'widget-group' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'core/widget-group',
		'title' => 'Widget Group',
		'category' => 'widgets',
		'attributes' => array(
			'title' => array(
				'type' => 'string'
			)
		),
		'supports' => array(
			'html' => false,
			'inserter' => true,
			'customClassName' => true,
			'reusable' => false
		),
		'editorStyle' => 'wp-block-widget-group-editor',
		'style' => 'wp-block-widget-group'
	)
);
