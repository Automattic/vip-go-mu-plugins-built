/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Widget = require( '../widget' );

/**
 * Welcome Widget Component
 */
var Widget_Welcome = React.createClass( {
	render: function() {
		return (
			<Widget className="widget__welcome" title="Welcome to WordPress.com VIP">
				<p>WordPress.com VIP is a partnership between WordPress.com and the most high-profile, innovative and smart WordPress websites out there. We’re excited to have you here.</p>

				<h3 className="widget__subtitle">Helpful Links</h3>

				<div className="widget__col-2">
					<ul className="widget__list">
						<li>
							<a href="https://lobby.vip.wordpress.com/" target="_blank">VIP Lobby</a>
							<span>Important service updates</span>
						</li>
						<li>
							<a href="https://vip.wordpress.com/documentation/vip-go/" target="_blank">VIP Go Documentation</a>
							<span>Coding for WordPress.com VIP Go</span>
						</li>
						<li>
							<a href="https://vip.wordpress.com/plugins/" target="_blank">VIP Plugins</a>
							<span>Approved VIP plugins</span>
						</li>
						<li>
							<a href="https://wordpressvip.zendesk.com/" target="_blank">VIP Support Portal</a>
							<span>Your organization’s tickets</span>
						</li>
					</ul>
				</div>

				<div className="widget__col-2">
					<ul className="widget__list">
						<li>
							<a href="https://vip.wordpress.com/documentation/vip-go/launch-checklist/" target="_blank">Launch Checklist</a>
							<span>Steps to launch</span>
						</li>
						<li>
							<a href="https://vip.wordpress.com/your-vip-toolbox/" target="_blank">Your VIP Toolbox</a>
							<span>Navigating VIP Tools</span>
						</li>
						<li>
							<a href="https://vip.wordpress.com/news/" target="_blank">VIP News</a>
							<span>New features, case studies</span>
						</li>
						<li>
							<a href="https://vip.wordpress.com/partners/" target="_blank">Featured Partners</a>
							<span>Agencies and technology partners</span>
						</li>
					</ul>
				</div>
			</Widget>
		);
	}
} );

module.exports = Widget_Welcome;
