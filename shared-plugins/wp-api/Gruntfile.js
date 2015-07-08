module.exports = function( grunt ) {

	'use strict';
	var banner = '/**\n * <%= pkg.homepage %>\n * Copyright (c) <%= grunt.template.today("yyyy") %>\n * This file is generated automatically. Do not edit.\n */\n';
	require('phplint').gruntPlugin(grunt);
	// Project configuration
	grunt.initConfig( {

		pkg:    grunt.file.readJSON( 'package.json' ),

		phpcs: {
			plugin: {
				src: './'
			},
			options: {
				bin: "vendor/bin/phpcs --extensions=php --ignore=\"*/vendor/*,*/node_modules/*\"",
				standard: "phpcs.ruleset.xml"
			}
		},

		phplint: {
			options: {
				limit: 10,
				stdout: true,
				stderr: true
			},
			files: ['lib/**/*.php', 'tests/*.php', '*.php']
		},

		phpunit: {
			'default': {
				cmd: 'phpunit',
				args: ['-c', 'phpunit.xml.dist']
			},
		},

	} );
	grunt.loadNpmTasks( 'grunt-phpcs' );

	// Testing tasks.
	grunt.registerMultiTask('phpunit', 'Runs PHPUnit tests, including the ajax, external-http, and multisite tests.', function() {
		grunt.util.spawn({
			cmd: this.data.cmd,
			args: this.data.args,
			opts: {stdio: 'inherit'}
		}, this.async());
	});

	grunt.registerTask( 'test', [ 'phpcs', 'phplint', 'phpunit' ] );
	grunt.util.linefeed = '\n';

};
