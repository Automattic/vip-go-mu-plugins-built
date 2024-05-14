// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require( '@wordpress/scripts/config/jest-unit.config' );

module.exports = {
	...baseConfig,
	silent: false,
	verbose: true,
};
