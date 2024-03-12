/**
 * WordPress dependencies
 */
import {
	Disabled,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { InputRange } from '../../common/components/input-range';
import { OnSettingChangeFunction } from '../editor-sidebar';
import { DEFAULT_MAX_LINK_WORDS, DEFAULT_MAX_LINKS } from './smart-linking';
import { SmartLinkingStore } from './store';

/**
 * Defines the props structure for SmartLinkingSettings.
 *
 * @since 3.14.0
 */
type SmartLinkingSettingsProps = {
	disabled?: boolean;
	selectedBlock?: string;
	onSettingChange: OnSettingChangeFunction
};

/**
 * Settings for the Smart Linking.
 *
 * @since 3.14.0
 *
 * @param {SmartLinkingSettingsProps} props The component's props.
 *
 * @return {JSX.Element} The JSX Element.
 */
export const SmartLinkingSettings = ( {
	disabled = false,
	selectedBlock,
	onSettingChange,
}: Readonly<SmartLinkingSettingsProps> ): JSX.Element => {
	/**
	 * Gets the value for the ToggleGroupControl.
	 *
	 * @since 3.14.0
	 */
	const getToggleGroupValue = ( ) => {
		if ( fullContent ) {
			return 'all';
		}

		if ( selectedBlock && selectedBlock !== 'all' ) {
			return 'selected';
		}
		return 'all';
	};

	const toggleGroupRef = useRef<HTMLDivElement>();
	const [ applyTo, setApplyTo ] = useState( getToggleGroupValue() );
	const [ wasProgrammaticallyClicked, setWasProgrammaticallyClicked ] = useState( false );

	/**
	 * Gets the settings from the Smart Linking store.
	 *
	 * @since 3.14.0
	 */
	const {
		maxLinks,
		maxLinkWords,
		fullContent,
		alreadyClicked,
	} = useSelect( ( select ) => {
		const { getMaxLinkWords, getMaxLinks, isFullContent, wasAlreadyClicked } = select( SmartLinkingStore );

		return {
			maxLinks: getMaxLinks(),
			maxLinkWords: getMaxLinkWords(),
			fullContent: isFullContent(),
			alreadyClicked: wasAlreadyClicked(),
		};
	}, [] );

	const {
		setMaxLinks,
		setMaxLinkWords,
		setFullContent,
		setAlreadyClicked,
	} = useDispatch( SmartLinkingStore );

	/**
	 * Handles the change event of the ToggleGroupControl.
	 * It updates the settings based on the selected value.
	 *
	 * @since 3.14.0
	 *
	 * @param {string|number|undefined} value The selected value.
	 */
	const onToggleGroupChange = ( value: string|number|undefined ) => {
		// Ignore the onToggleGroupChange event if it was triggered programmatically.
		if ( wasProgrammaticallyClicked ) {
			setWasProgrammaticallyClicked( false );
			return;
		}

		if ( disabled ) {
			return;
		}

		// Update the settings based on the selected value.
		if ( value === 'all' ) {
			setFullContent( true );
		} else {
			setFullContent( false );
		}
		setApplyTo( value as string );
	};

	useEffect( () => {
		if ( disabled ) {
			return;
		}
		const value = getToggleGroupValue();
		setApplyTo( value );

		// The first time selectedBlock changes, for some reason the ToggleGroupControl
		// doesn't update the value. This workaround programmatically clicks the button
		// to set the correct value.
		if ( toggleGroupRef.current && value && ! alreadyClicked && selectedBlock ) {
			const targetButton = toggleGroupRef.current.querySelector( `button[data-value="${ value }"]` ) as HTMLButtonElement;
			if ( targetButton && targetButton.getAttribute( 'aria-checked' ) !== 'true' ) {
				// Simulate a click on the button to set the correct value.
				targetButton.click();
				// Flag that the button was clicked programmatically.
				setWasProgrammaticallyClicked( true );
				// Flag that the button was already clicked as it's only needed on the first time.
				setAlreadyClicked( true );
			}
		}
	}, [ selectedBlock, fullContent, disabled ] ); // eslint-disable-line

	return (
		<div className="parsely-panel-settings">
			<div className="parsely-panel-settings-body">
				<div className="smart-linking-block-select">
					<Disabled isDisabled={ disabled }	>
						<ToggleGroupControl
							ref={ toggleGroupRef }
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							isBlock
							value={ fullContent ? 'all' : applyTo }
							label={ __( 'Apply Smart Links to', 'wp-parsely' ) }
							onChange={ onToggleGroupChange }
						>
							<ToggleGroupControlOption
								label={ __( 'Selected Block', 'wp-parsely' ) }
								disabled={ ! selectedBlock }
								value="selected" />
							<ToggleGroupControlOption
								label={ __( 'All Blocks', 'wp-parsely' ) }
								value="all" />
						</ToggleGroupControl>
					</Disabled>
				</div>
				<div className="smart-linking-settings">
					<InputRange
						value={ maxLinks }
						onChange={ ( value ) => {
							setMaxLinks( value ?? 1 );
							onSettingChange( 'SmartLinkingMaxLinks', value ?? DEFAULT_MAX_LINKS );
						} }
						label={ __( 'Max Number of Links', 'wp-parsely' ) }
						suffix={ __( 'Links', 'wp-parsely' ) }
						min={ 1 }
						max={ 20 }
						initialPosition={ maxLinks }
						disabled={ disabled }
					/>
					<InputRange
						value={ maxLinkWords }
						onChange={ ( value ) => {
							setMaxLinkWords( value ?? 1 );
							onSettingChange( 'SmartLinkingMaxLinkWords', value ?? DEFAULT_MAX_LINK_WORDS );
						} }
						label={ __( 'Max Link Length', 'wp-parsely' ) }
						suffix={ __( 'Words', 'wp-parsely' ) }
						min={ 1 }
						max={ 8 }
						initialPosition={ maxLinkWords }
						disabled={ disabled }
					/>
				</div>
			</div>
		</div>
	);
};
