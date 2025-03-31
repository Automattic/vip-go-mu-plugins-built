// The exports of `@wordpress/scripts/config/webpack.config` differ depending
// on whether you pass the `--experimental-modules` flag. If you do, it exports
// an array of two configurations instead of a single configuration object.
const [ scriptConfig, moduleConfig ] = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

// This function modernizes the configuration object to support TypeScript. It
// also allows for additional scripts to be added to the entry point. Blocks are
// included by default, so this is only needed for non-block scripts.
function modernize( config, additionalScripts = {}, additionalPlugins = [] ) {
	return {
		...config,
		entry: {
			...config.entry(),
			...additionalScripts,
		},
		module: {
			rules: config.module.rules.concat( [
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: 'ts-loader',
							options: {
								transpileOnly: true,
							},
						},
					],
				},
			] ),
		},
		plugins: [ ...config.plugins, ...additionalPlugins ],
		resolve: {
			...config.resolve,
			alias: {
				...config.resolve.alias,
				'@': path.resolve( __dirname, 'src/' ),
			},
		},
	};
}

exports.modernize = modernize;
exports.moduleConfig = moduleConfig;
exports.scriptConfig = scriptConfig;
