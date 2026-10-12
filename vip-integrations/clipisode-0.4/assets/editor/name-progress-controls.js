( function ( wp ) {
	if (
		! wp ||
		! wp.hooks ||
		! wp.element ||
		! wp.blockEditor ||
		! wp.components ||
		! wp.compose ||
		! wp.data
	) {
		return;
	}

	const addFilter = wp.hooks.addFilter;
	const Fragment = wp.element.Fragment;
	const createElement = wp.element.createElement;
	const InspectorControls = wp.blockEditor.InspectorControls;
	const ColorPalette = wp.blockEditor.ColorPalette || wp.components.ColorPalette;
	const PanelBody = wp.components.PanelBody;
	const SelectControl = wp.components.SelectControl;
	const RangeControl = wp.components.RangeControl;
	const BaseControl = wp.components.BaseControl;
	const createHigherOrderComponent = wp.compose.createHigherOrderComponent;
	const useSelect = wp.data.useSelect;
	const useDispatch = wp.data.useDispatch;
	const __ =
		wp.i18n && wp.i18n.__
			? wp.i18n.__
			: function ( s ) {
					return s;
			  };

	if ( ! ColorPalette ) {
		return;
	}

	const TRACK_CLASS = 'clipisode-name-progress-track-preview';
	const FILL_CLASS = 'clipisode-name-progress-fill-preview';
	const PIN_CLASSES = [ 'clipisode-pin-top', 'clipisode-pin-bottom', 'clipisode-pin-none' ];

	function hasClass( className, target ) {
		if ( ! className || ! target ) {
			return false;
		}
		return className.split( /\s+/ ).indexOf( target ) !== -1;
	}

	function readPin( className ) {
		if ( hasClass( className, 'clipisode-pin-top' ) ) {
			return 'top';
		}
		if ( hasClass( className, 'clipisode-pin-bottom' ) ) {
			return 'bottom';
		}
		return 'none';
	}

	function writePin( className, pin ) {
		const next = ( className || '' )
			.split( /\s+/ )
			.filter( Boolean )
			.filter( function ( token ) {
				return PIN_CLASSES.indexOf( token ) === -1;
			} );
		if ( pin === 'top' ) {
			next.push( 'clipisode-pin-top' );
		} else if ( pin === 'bottom' ) {
			next.push( 'clipisode-pin-bottom' );
		} else {
			next.push( 'clipisode-pin-none' );
		}
		return next.join( ' ' );
	}

	function parsePx( value, fallback ) {
		if ( typeof value === 'number' && Number.isFinite( value ) ) {
			return value;
		}
		if ( typeof value !== 'string' ) {
			return fallback;
		}
		const m = value.match( /^(\d+(?:\.\d+)?)px$/i );
		if ( ! m ) {
			return fallback;
		}
		const n = Number( m[ 1 ] );
		return Number.isFinite( n ) ? n : fallback;
	}

	function ProgressControlsPanel( props ) {
		const attrs = props.attributes || {};
		const className = attrs.className || '';
		const style = attrs.style || {};
		const pin = readPin( className );
		const trackColor =
			style.color && style.color.background
				? style.color.background
				: '#e5e7eb';
		const thickness = parsePx(
			style.dimensions && style.dimensions.minHeight,
			8
		);

		const fillClientId = useSelect(
			function ( select ) {
				const block = select( 'core/block-editor' ).getBlock( props.clientId );
				if ( ! block || ! Array.isArray( block.innerBlocks ) ) {
					return '';
				}
				const fill = block.innerBlocks.find( function ( inner ) {
					return hasClass(
						inner && inner.attributes ? inner.attributes.className : '',
						FILL_CLASS
					);
				} );
				return fill ? fill.clientId : '';
			},
			[ props.clientId ]
		);

		const fillColor = useSelect(
			function ( select ) {
				if ( ! fillClientId ) {
					return '#3964b0';
				}
				const fillBlock = select( 'core/block-editor' ).getBlock( fillClientId );
				const fillStyle =
					fillBlock && fillBlock.attributes ? fillBlock.attributes.style : {};
				if (
					fillStyle &&
					fillStyle.color &&
					typeof fillStyle.color.background === 'string'
				) {
					return fillStyle.color.background;
				}
				return '#3964b0';
			},
			[ fillClientId ]
		);

		const dispatch = useDispatch( 'core/block-editor' );
		const updateBlockAttributes = dispatch.updateBlockAttributes;

		function setPin( value ) {
			props.setAttributes( {
				className: writePin( className, value || 'none' ),
			} );
		}

		function setThickness( value ) {
			if ( typeof value !== 'number' || ! Number.isFinite( value ) ) {
				return;
			}
			const nextStyle = Object.assign( {}, style, {
				dimensions: Object.assign( {}, style.dimensions || {}, {
					minHeight: `${ value }px`,
				} ),
			} );
			props.setAttributes( { style: nextStyle } );
		}

		function setTrackColor( value ) {
			if ( ! value ) {
				return;
			}
			const nextStyle = Object.assign( {}, style, {
				color: Object.assign( {}, style.color || {}, {
					background: value,
				} ),
			} );
			props.setAttributes( { style: nextStyle } );
		}

		function setFillColor( value ) {
			if ( ! value || ! fillClientId ) {
				return;
			}
			const fillBlock = wp.data.select( 'core/block-editor' ).getBlock( fillClientId );
			if ( ! fillBlock || ! fillBlock.attributes ) {
				return;
			}
			const fillStyle = fillBlock.attributes.style || {};
			const nextFillStyle = Object.assign( {}, fillStyle, {
				color: Object.assign( {}, fillStyle.color || {}, {
					background: value,
				} ),
			} );
			updateBlockAttributes( fillClientId, { style: nextFillStyle } );
		}

		return createElement(
			InspectorControls,
			null,
			createElement(
				PanelBody,
				{
					title: __( 'Upload progress bar', 'clipisode' ),
					initialOpen: true,
				},
				createElement( SelectControl, {
					label: __( 'Pinned position', 'clipisode' ),
					value: pin,
					options: [
						{ label: __( 'None', 'clipisode' ), value: 'none' },
						{ label: __( 'Top', 'clipisode' ), value: 'top' },
						{ label: __( 'Bottom', 'clipisode' ), value: 'bottom' },
					],
					onChange: setPin,
				} ),
				createElement( RangeControl, {
					label: __( 'Bar thickness', 'clipisode' ),
					min: 2,
					max: 32,
					step: 1,
					value: thickness,
					onChange: setThickness,
				} ),
				createElement(
					BaseControl,
					{
						label: __( 'Track color', 'clipisode' ),
					},
					createElement( ColorPalette, {
						value: trackColor,
						onChange: setTrackColor,
					} )
				),
				createElement(
					BaseControl,
					{
						label: __( 'Animating fill color', 'clipisode' ),
					},
					createElement( ColorPalette, {
						value: fillColor,
						onChange: setFillColor,
					} )
				)
			)
		);
	}

	const withProgressInspector = createHigherOrderComponent( function ( BlockEdit ) {
		return function ( props ) {
			if (
				props.name !== 'core/group' ||
				! hasClass( props.attributes ? props.attributes.className : '', TRACK_CLASS )
			) {
				return createElement( BlockEdit, props );
			}
			return createElement(
				Fragment,
				null,
				createElement( BlockEdit, props ),
				createElement( ProgressControlsPanel, props )
			);
		};
	}, 'withClipisodeProgressInspector' );

	addFilter(
		'editor.BlockEdit',
		'clipisode/name-progress-controls-inspector',
		withProgressInspector
	);
} )( window.wp );
