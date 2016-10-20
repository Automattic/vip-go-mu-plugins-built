/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'fbjs/lib/joinClasses' );

/**
 * Internal dependencies
 */
var Config = require( '../config.js' ),
	Nav = require( '../nav' );

/**
 * Header Component
 */
var Header = React.createClass( {
	getInitialState: function() {
		{
		// to-do: 'User Management', 'SVN Access', 'Revisions', 'Support', 'Billing'
		}
		return {
			nav: [
				{
					title: 'Dashboard',
					url: 'vip-dashboard'
				},
				{
					title: 'Plugins',
					url: 'vip-plugins'
				}
			]
		};
	},

	render: function() {
		return (
			<div className={ joinClasses( this.props.className, 'top-header' ) }>
				<h1><img src={ Config.asseturl + 'img/wpcom-vip-logo.svg' } alt="WordPress.com VIP" className="top-header__logo" /></h1>

				<Nav items={ this.state.nav } />,

				{ this.props.children }

			</div>
		);
	}
} );

module.exports = Header;
