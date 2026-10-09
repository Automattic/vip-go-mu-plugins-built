/**
 * Share a Draft editor integration.
 *
 * Adds a "Share a Draft" panel to the post sidebar with two actions: generate a
 * new shareable preview link (expiration + a viewer cap), and manage the post's
 * existing links (see their usage and time left, and revoke them).
 */

import { registerPlugin } from '@wordpress/plugins';
import {
	PluginDocumentSettingPanel,
	store as editorStore,
} from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import {
	Button,
	Flex,
	FlexBlock,
	FlexItem,
	Modal,
	Notice,
	SelectControl,
	Spinner,
	TextControl,
	VisuallyHidden,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __, _n, sprintf } from '@wordpress/i18n';

const REST_BASE = '/shareadraft/v1/preview-links';

const settings = window.shareADraft || {
	expirationOptions: [],
	defaultExpiration: 28800,
	maxUsesLimit: 1000,
	hasCentralIpRanges: false,
	linksDisabled: false,
	ipAllowlistEnabled: true,
	recipientsEnabled: true,
};

const expirationOptions = ( settings.expirationOptions || [] ).map(
	( option ) => ( {
		label: option.label,
		value: String( option.seconds ),
	} )
);

/**
 * A short, human relative time until a Unix timestamp, e.g. "in about 5 hours".
 * @param {number} targetSeconds Unix timestamp, in seconds.
 */
function timeUntil( targetSeconds ) {
	const remaining = targetSeconds - Math.floor( Date.now() / 1000 );

	if ( remaining <= 0 ) {
		return __( 'expired', 'shareadraft' );
	}

	// A site can filter in a very long lifetime for an effectively indefinite
	// link; show that as "no expiry" rather than "expires in 520 weeks".
	if ( remaining > 5 * 365 * 86400 ) {
		return __( 'no expiry', 'shareadraft' );
	}

	const units = [
		[ 86400, __( 'day', 'shareadraft' ), __( 'days', 'shareadraft' ) ],
		[ 3600, __( 'hour', 'shareadraft' ), __( 'hours', 'shareadraft' ) ],
		[ 60, __( 'minute', 'shareadraft' ), __( 'minutes', 'shareadraft' ) ],
		[ 1, __( 'second', 'shareadraft' ), __( 'seconds', 'shareadraft' ) ],
	];

	for ( const [ size, singular, plural ] of units ) {
		if ( remaining >= size ) {
			const count = Math.floor( remaining / size );
			return sprintf(
				/* translators: 1: a number, 2: a unit of time such as "hours". */
				__( 'expires in %1$d %2$s', 'shareadraft' ),
				count,
				1 === count ? singular : plural
			);
		}
	}

	return __( 'expires soon', 'shareadraft' );
}

function usageLabel( link ) {
	if ( null === link.max_uses ) {
		return sprintf(
			/* translators: %d: number of times the link has been viewed. */
			_n(
				'%d view · no limit',
				'%d views · no limit',
				link.use_count,
				'shareadraft'
			),
			link.use_count
		);
	}

	return sprintf(
		/* translators: 1: views so far, 2: maximum views. */
		__( '%1$d of %2$d views', 'shareadraft' ),
		link.use_count,
		link.max_uses
	);
}

function GenerateModal( { postId, onCreated, onClose } ) {
	const [ expiration, setExpiration ] = useState(
		String( settings.defaultExpiration )
	);
	const [ maxUses, setMaxUses ] = useState( '' );
	const [ allowedIps, setAllowedIps ] = useState( '' );
	const [ recipients, setRecipients ] = useState( '' );
	const [ url, setUrl ] = useState( '' );
	const [ isBusy, setBusy ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ copied, setCopied ] = useState( false );

	const splitList = ( value ) =>
		value
			.split( /[\s,]+/ )
			.map( ( item ) => item.trim() )
			.filter( ( item ) => '' !== item );

	const hasRecipients = splitList( recipients ).length > 0;

	// Lock the settings while the link is being created and once it exists,
	// so they always describe the link that was actually issued.
	const isLocked = isBusy || !! url;

	// Core greys out a disabled select but not a disabled text input, and
	// neither changes the cursor; make every locked field read as locked.
	const lockedStyle = isLocked
		? { cursor: 'not-allowed', backgroundColor: '#f0f0f0' }
		: undefined;

	const copyToClipboard = async ( text ) => {
		try {
			await window.navigator.clipboard.writeText( text );
			setCopied( true );
		} catch {
			// Clipboard access can be denied; the link is shown for manual copy.
			setCopied( false );
		}
	};

	const copyLink = async () => {
		// Once a link exists the button only copies it; calling the API again
		// would issue a second live link.
		if ( url ) {
			await copyToClipboard( url );
			return;
		}

		setBusy( true );
		setError( '' );

		try {
			const response = await apiFetch( {
				path: REST_BASE,
				method: 'POST',
				data: {
					post_id: postId,
					expiration: parseInt( expiration, 10 ),
					max_uses: '' === maxUses ? null : parseInt( maxUses, 10 ),
					allowed_ips: splitList( allowedIps ),
					recipients: splitList( recipients ),
				},
			} );

			setUrl( response.url );
			onCreated();
			await copyToClipboard( response.url );
		} catch ( requestError ) {
			setError(
				requestError.message ||
					__(
						'The preview link could not be generated.',
						'shareadraft'
					)
			);
		} finally {
			setBusy( false );
		}
	};

	return (
		<Modal
			title={ __( 'Generate preview link', 'shareadraft' ) }
			onRequestClose={ onClose }
			// Closing mid-request would discard the only copy of a link the
			// server still creates, so the dialog stays open until it lands.
			isDismissible={ ! isBusy }
			shouldCloseOnEsc={ ! isBusy }
			shouldCloseOnClickOutside={ ! isBusy }
			size="medium"
		>
			{ /* Space the fields as core's own modals do (16px between each). */ }
			<Flex direction="column" align="stretch" gap={ 4 }>
				{ settings.linksDisabled && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'Preview links are currently disabled site-wide. You can generate new links, but they will not work until an administrator re-enables preview links.',
							'shareadraft'
						) }
					</Notice>
				) }

				<Notice status="warning" isDismissible={ false }>
					{ hasRecipients
						? __(
								'Only the listed reviewers will be able to open this link, after verifying their email address.',
								'shareadraft'
							)
						: __(
								'Anyone with this link will be able to preview the post.',
								'shareadraft'
							) }
				</Notice>

				<SelectControl
					label={ __( 'Link expiration', 'shareadraft' ) }
					value={ expiration }
					options={ expirationOptions }
					onChange={ setExpiration }
					disabled={ isLocked }
					style={ lockedStyle }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>

				<TextControl
					type="number"
					min={ 1 }
					max={ settings.maxUsesLimit ?? undefined }
					step={ 1 }
					label={ __( 'Maximum uses', 'shareadraft' ) }
					help={
						null === settings.maxUsesLimit
							? __(
									'How many people can open this link. Opening it in another browser or device counts as a new person. Leave empty for unlimited.',
									'shareadraft'
								)
							: sprintf(
									/* translators: %1$d: the most viewers a link may allow, e.g. 1000. */
									__(
										'How many people can open this link, up to %1$d. Opening it in another browser or device counts as a new person. Leave empty for %1$d.',
										'shareadraft'
									),
									settings.maxUsesLimit
								)
					}
					value={ maxUses }
					onChange={ setMaxUses }
					disabled={ isLocked }
					style={ lockedStyle }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>

				{ settings.recipientsEnabled && (
					<TextControl
						label={ __( 'Restrict to reviewers', 'shareadraft' ) }
						help={ __(
							'Comma-separated email addresses. Each reviewer must verify their address with an emailed code before viewing. Leave empty to let anyone with the link view.',
							'shareadraft'
						) }
						value={ recipients }
						onChange={ setRecipients }
						disabled={ isLocked }
						style={ lockedStyle }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				) }

				{ settings.ipAllowlistEnabled && (
					<TextControl
						label={ __( 'Allowed IP ranges', 'shareadraft' ) }
						help={
							settings.hasCentralIpRanges
								? __(
										'Comma-separated IPv4/IPv6 addresses or CIDR ranges. Every link already opens only from the ranges set in the VIP Dashboard; ranges added here let this link open from these places too. Leave empty to add none.',
										'shareadraft'
									)
								: __(
										'Comma-separated IPv4/IPv6 addresses or CIDR ranges, e.g. 203.0.113.0/24. The link then opens only from these ranges: this limits where it opens, not who opens it. Leave empty for no IP restriction.',
										'shareadraft'
									)
						}
						value={ allowedIps }
						onChange={ setAllowedIps }
						disabled={ isLocked }
						style={ lockedStyle }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				) }

				{ error && (
					<Notice status="error" isDismissible={ false }>
						{ error }
					</Notice>
				) }

				{ url && (
					<TextControl
						label={ __( 'Preview link', 'shareadraft' ) }
						value={ url }
						readOnly
						onFocus={ ( event ) => event.target.select() }
						__next40pxDefaultSize
						help={
							copied
								? __( 'Copied to clipboard.', 'shareadraft' )
								: __(
										'Copy this link to share it.',
										'shareadraft'
									)
						}
						__nextHasNoMarginBottom
					/>
				) }

				<Flex justify="flex-end" gap={ 2 }>
					{ url && (
						// Unlock the fields, keeping their values, so a further
						// link (say, for another reviewer) needs only a tweak.
						<Button
							variant="secondary"
							onClick={ () => {
								setUrl( '' );
								setCopied( false );
							} }
							__next40pxDefaultSize
						>
							{ __( 'Generate another link', 'shareadraft' ) }
						</Button>
					) }

					<Button
						variant="primary"
						onClick={ copyLink }
						isBusy={ isBusy }
						disabled={ isBusy || ! postId }
						// Keep focus on the button while busy rather than letting
						// the browser drop it out of the dialog.
						accessibleWhenDisabled
						__next40pxDefaultSize
					>
						{ url
							? __( 'Copy link', 'shareadraft' )
							: __( 'Generate link', 'shareadraft' ) }
					</Button>
				</Flex>
			</Flex>
		</Modal>
	);
}

const mutedStyle = { color: '#757575', fontSize: '12px' };

function ManageModal( { postId, onLinksChange, onClose } ) {
	const [ links, setLinks ] = useState( null );
	const [ error, setError ] = useState( '' );
	const [ , setTick ] = useState( 0 );

	const load = async () => {
		try {
			const data = await apiFetch( {
				path: `${ REST_BASE }?post_id=${ postId }`,
			} );
			setLinks( data );
		} catch ( requestError ) {
			setError(
				requestError.message ||
					__( 'Could not load links.', 'shareadraft' )
			);
			// The links are unknown, not gone: keep Manage usable to retry.
			setLinks( null );
			onLinksChange( true );
		}
	};

	useEffect( () => {
		load();
		// Re-render every 30 seconds so the "expires in …" labels stay current.
		const timer = window.setInterval(
			() => setTick( ( t ) => t + 1 ),
			30000
		);
		return () => window.clearInterval( timer );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Report each revoke (and any failed-revoke reload) as it happens.
	useEffect( () => {
		if ( null !== links ) {
			onLinksChange( links.length > 0 );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ links ] );

	const revoke = async ( id ) => {
		setLinks( ( current ) => current.filter( ( link ) => link.id !== id ) );
		try {
			await apiFetch( {
				path: `${ REST_BASE }/${ id }?post_id=${ postId }`,
				method: 'DELETE',
			} );
		} catch ( requestError ) {
			// Put it back and surface the problem if the revoke did not stick.
			setError(
				requestError.message ||
					__( 'Could not revoke the link.', 'shareadraft' )
			);
			load();
		}
	};

	return (
		<Modal
			title={ __( 'Manage preview links', 'shareadraft' ) }
			onRequestClose={ onClose }
			size="medium"
		>
			{ settings.linksDisabled && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'Preview links are currently disabled site-wide. None of the links below work until an administrator re-enables preview links.',
						'shareadraft'
					) }
				</Notice>
			) }

			{ error && (
				<Notice
					status="error"
					// With no list to fall back on, the error is all there is to show.
					isDismissible={ null !== links }
					onRemove={ () => setError( '' ) }
				>
					{ error }
				</Notice>
			) }

			{ settings.hasCentralIpRanges && (
				<p style={ { ...mutedStyle, marginTop: 0 } }>
					{ __(
						'Every link opens only from the IP ranges set in the VIP Dashboard, plus any ranges shown on the link itself.',
						'shareadraft'
					) }
				</p>
			) }

			{ null === links && ! error && <Spinner /> }

			{ null !== links && 0 === links.length && (
				<p>{ __( 'No active preview links.', 'shareadraft' ) }</p>
			) }

			{ null !== links &&
				links.map( ( link ) => (
					<Flex
						key={ link.id }
						align="center"
						gap={ 4 }
						style={ {
							padding: '12px 0',
							borderBottom: '1px solid #f0f0f0',
						} }
					>
						<FlexBlock>
							<div style={ { fontWeight: 500 } }>
								{ sprintf(
									/* translators: %s: date and time the link was created. */
									__( 'Created %s', 'shareadraft' ),
									new Date(
										link.created_at * 1000
									).toLocaleString( undefined, {
										dateStyle: 'medium',
										timeStyle: 'short',
									} )
								) }
							</div>
							<div style={ mutedStyle }>
								{ [
									usageLabel( link ),
									timeUntil( link.expires_at ),
									link.token_hint &&
										sprintf(
											/* translators: %s: the last few characters of the link's token. */
											__( 'ending %s', 'shareadraft' ),
											link.token_hint
										),
								]
									.filter( Boolean )
									.join( ' · ' ) }
							</div>
							{ Array.isArray( link.recipients ) &&
								link.recipients.length > 0 && (
									<div style={ mutedStyle }>
										{ sprintf(
											/* translators: %s: comma-separated email addresses. */
											__(
												'Reviewers: %s',
												'shareadraft'
											),
											link.recipients.join( ', ' )
										) }
									</div>
								) }
							{ Array.isArray( link.allowed_ips ) &&
								link.allowed_ips.length > 0 && (
									<div style={ mutedStyle }>
										{ sprintf(
											/* translators: %s: comma-separated IP ranges. */
											__(
												'Restricted to %s',
												'shareadraft'
											),
											link.allowed_ips.join( ', ' )
										) }
									</div>
								) }
						</FlexBlock>
						<FlexItem>
							<Button
								variant="tertiary"
								isDestructive
								onClick={ () => revoke( link.id ) }
								// Every row has a "Revoke"; name which link it acts on.
								label={
									link.token_hint
										? sprintf(
												/* translators: %s: the last few characters of the link's token. */
												__(
													'Revoke link ending %s',
													'shareadraft'
												),
												link.token_hint
											)
										: undefined
								}
							>
								{ __( 'Revoke', 'shareadraft' ) }
							</Button>
						</FlexItem>
					</Flex>
				) ) }
		</Modal>
	);
}

// Match core's full-width, grey-bordered sidebar buttons ("Set featured image").
const panelButtonStyle = {
	width: '100%',
	justifyContent: 'center',
	borderColor: '#ccc',
};

function ShareADraftPanel() {
	const { postId, status, isViewable } = useSelect( ( select ) => {
		const editor = select( editorStore );
		return {
			postId: editor.getCurrentPostId(),
			status: editor.getEditedPostAttribute( 'status' ),
			isViewable: !! select( coreStore ).getPostType(
				editor.getCurrentPostType()
			)?.viewable,
		};
	}, [] );

	// A published post is already public, a private or trashed one is closed on
	// purpose, and a type with no front-end view would only 404.
	const isShareable =
		isViewable && ! [ 'publish', 'private', 'trash' ].includes( status );

	const [ openModal, setOpenModal ] = useState( '' );
	const [ hasLinks, setHasLinks ] = useState( false );

	// Check once on load; the modals report changes as they happen.
	useEffect( () => {
		if ( ! postId || ! isShareable ) {
			return;
		}

		apiFetch( { path: `${ REST_BASE }?post_id=${ postId }` } )
			.then( ( links ) => setHasLinks( links.length > 0 ) )
			// Leave Manage usable so its modal can surface the error.
			.catch( () => setHasLinks( true ) );
	}, [ postId, isShareable ] );

	if ( ! isShareable ) {
		return null;
	}

	return (
		<PluginDocumentSettingPanel
			name="shareadraft"
			title={ __( 'Share a Draft', 'shareadraft' ) }
		>
			<Button
				onClick={ () => setOpenModal( 'generate' ) }
				disabled={ ! postId }
				style={ { ...panelButtonStyle, marginBottom: '8px' } }
				__next40pxDefaultSize
			>
				{ __( 'Generate preview link', 'shareadraft' ) }
			</Button>

			<Button
				onClick={ () => setOpenModal( 'manage' ) }
				disabled={ ! postId || ! hasLinks }
				accessibleWhenDisabled
				aria-describedby={
					hasLinks ? undefined : 'shareadraft-manage-description'
				}
				style={ panelButtonStyle }
				__next40pxDefaultSize
			>
				{ __( 'Manage preview links', 'shareadraft' ) }
			</Button>

			{ ! hasLinks && (
				<VisuallyHidden id="shareadraft-manage-description">
					{ __(
						'Available once this post has an active preview link.',
						'shareadraft'
					) }
				</VisuallyHidden>
			) }

			{ 'generate' === openModal && (
				<GenerateModal
					postId={ postId }
					onCreated={ () => setHasLinks( true ) }
					onClose={ () => setOpenModal( '' ) }
				/>
			) }

			{ 'manage' === openModal && (
				<ManageModal
					postId={ postId }
					onLinksChange={ setHasLinks }
					onClose={ () => setOpenModal( '' ) }
				/>
			) }
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'shareadraft', { render: ShareADraftPanel } );
