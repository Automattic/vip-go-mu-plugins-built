/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' );

/**
 * Internal dependencies
 */

/**
 * Widget Component
 */
Main = React.createClass( {
	render: function() {
		return (
			<main className={ joinClasses( this.props.className, 'main' ) } role="main">
				{ this.props.children }
			</main>
		);
	}
} );
module.exports = Main;