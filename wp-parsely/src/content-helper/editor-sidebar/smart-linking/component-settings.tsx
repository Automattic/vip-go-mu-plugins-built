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
import { SmartLinkingSettings as Settings } from '../../common/settings';
import { DEFAULT_MAX_LINK_WORDS, DEFAULT_MAX_LINKS } from './smart-linking';
import { ApplyToOptions, SmartLinkingStore } from './store';

/**
 * Defines the props structure for SmartLinkingSettings.
 *
 * @since 3.14.0
 */
type SmartLinkingSettingsProps = {
	disabled?: boolean;
	selectedBlock?: string;
	onSettingChange: ( setting: keyof Settings, value: number ) => void;
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
	const toggleGroupRef = useRef<HTMLDivElement>();
	const [ hint, setHint ] = useState<string|null>( '' );
	const [ animationIsRunning, setAnimationIsRunning ] = useState<boolean>( false );
	const [ , setForceUpdate ] = useState<boolean>( false );

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
		applyTo,
	} = useSelect( ( select ) => {
		const { getMaxLinkWords, getMaxLinks, isFullContent, wasAlreadyClicked, getApplyTo } = select( SmartLinkingStore );

		return {
			maxLinks: getMaxLinks(),
			maxLinkWords: getMaxLinkWords(),
			fullContent: isFullContent(),
			alreadyClicked: wasAlreadyClicked(),
			applyTo: getApplyTo(),
		};
	}, [] );

	const {
		setMaxLinks,
		setMaxLinkWords,
		setFullContent,
		setAlreadyClicked,
		setApplyTo,
	} = useDispatch( SmartLinkingStore );

	/**
	 * The area to apply the smart links to.
	 *
	 * It defaults to 'selected' if there is a selected block, otherwise it defaults to 'all'.
	 * Used in the ToggleGroupControl value prop.
	 *
	 * @since 3.14.3
	 */
	const applyToValue = applyTo as string ?? ( selectedBlock ? 'selected' : 'all' );

	/**
	 * Handles the change event of the ToggleGroupControl.
	 * It updates the settings based on the selected value.
	 *
	 * @since 3.14.0
	 *
	 * @param {string|number|undefined} value The selected value.
	 */
	const onToggleGroupChange = async ( value: string|number|undefined ) => {
		if ( disabled ) {
			return;
		}
		// Flag to identify if the button animation is running.
		setAnimationIsRunning( true );

		// Update the settings based on the selected value.
		await setFullContent( ApplyToOptions.All === value );
		await setApplyTo( value as ApplyToOptions );

		// Wait for the button animation to finish before setting the flag to false.
		setTimeout( () => {
			setAnimationIsRunning( false );
		}, 500 );
	};

	/**
	 * Handles changing the button position and showing a hint if there is no selected block.
	 *
	 * @since 3.14.3
	 */
	useEffect( () => {
		if ( disabled ) {
			return;
		}

		const moveButtonAndShowHint = () => {
			// Do not move the button if the interaction is disabled.
			if ( disabled ) {
				return;
			}

			if ( applyTo === ApplyToOptions.Selected ) {
				setTimeout( () => {
					setHint( __( 'No block selected. Select a block to apply smart links.', 'wp-parsely' ) );
				}, 100 );
			}
			setApplyTo( null );

			// Force update to re-render the ToggleGroupControl.
			setForceUpdate( ( force ) => ! force );
		};

		// If there isn't a selected block, move the focus to the
		// "All Blocks" button and set the hint to the user.
		if ( ! selectedBlock && applyTo !== ApplyToOptions.All ) {
			// If the button changing animation is running, wait for it to finish.
			if ( animationIsRunning ) {
				setTimeout( moveButtonAndShowHint, 500 );
			} else {
				moveButtonAndShowHint();
			}
		}

		setFullContent( ApplyToOptions.All === applyToValue );
	}, [ animationIsRunning, applyTo, applyToValue, disabled, selectedBlock, setApplyTo, setFullContent, setHint ] );

	/**
	 * Applies workaround to set the value of the ToggleGroupControl programmatically.
	 *
	 * This is needed because the ToggleGroupControl doesn't update the value when the
	 * selectedBlock changes for the first time.
	 *
	 * @since 3.14.0
	 */
	useEffect( () => {
		if ( disabled ) {
			return;
		}

		// The first time selectedBlock changes, for some reason the ToggleGroupControl
		// doesn't update the value. This workaround sets the value programmatically.
		if ( toggleGroupRef.current && applyToValue && ! alreadyClicked && selectedBlock ) {
			const targetButton = toggleGroupRef.current.querySelector( `button[data-value="${ applyToValue }"]` ) as HTMLButtonElement;
			if ( targetButton && targetButton.getAttribute( 'aria-checked' ) !== 'true' ) {
				setApplyTo( applyToValue as ApplyToOptions );
				// Flag that the button was already set as it's only needed on the first time.
				setAlreadyClicked( true );
			}
		}
	}, [ selectedBlock, fullContent, disabled, applyTo ] ); // eslint-disable-line

	/**
	 * Resets the hint when the selected block changes.
	 *
	 * @since 3.14.0
	 * @since 3.14.3 Moved from 'component.tsx' to 'component-settings.tsx'.
	 */
	useEffect( () => {
		setHint( null );
	}, [ selectedBlock ] );

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
							value={ applyToValue }
							label={ __( 'Apply Smart Links to', 'wp-parsely' ) }
							onChange={ onToggleGroupChange }
						>
							<ToggleGroupControlOption
								label={ __( 'Selected Block', 'wp-parsely' ) }
								value="selected" />
							<ToggleGroupControlOption
								label={ __( 'All Blocks', 'wp-parsely' ) }
								value="all" />
						</ToggleGroupControl>
					</Disabled>
					{ hint && (
						<div className="wp-parsely-smart-linking-hint" >
							<strong>{ __( 'Hint:', 'wp-parsely' ) }</strong> { hint }
						</div>
					) }
				</div>
				<div className="smart-linking-settings">
					<InputRange
						value={ maxLinks }
						onChange={ ( value ) => {
							setMaxLinks( value ?? 1 );
							onSettingChange( 'MaxLinks', value ?? DEFAULT_MAX_LINKS );
						} }
						label={ __( 'Target Number of Links', 'wp-parsely' ) }
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
							onSettingChange( 'MaxLinkWords', value ?? DEFAULT_MAX_LINK_WORDS );
						} }
						label={ __( 'Target Link Length', 'wp-parsely' ) }
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
