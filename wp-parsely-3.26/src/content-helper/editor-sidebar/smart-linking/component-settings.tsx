/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { BlockInstance, getBlockType } from '@wordpress/blocks';
import {
	Disabled,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { InputRange } from '../../common/components/input-range';
import { SmartLinkingSettings as Settings } from '../../common/settings';
import { ALLOWED_BLOCKS, DEFAULT_MAX_LINKS } from './smart-linking';
import { ApplyToOptions, SmartLinkingStore } from './store';

/**
 * Defines the props structure for SmartLinkingSettings.
 *
 * @since 3.14.0
 */
type SmartLinkingSettingsProps = {
	disabled?: boolean;
	selectedBlock: BlockInstance|null;
	onSettingChange: ( setting: keyof Settings, value: number ) => void;
};

/**
 * Settings for the Smart Linking.
 *
 * @since 3.14.0
 *
 * @param {SmartLinkingSettingsProps} props The component's props.
 *
 * @return {import('react').JSX.Element} The JSX Element.
 */
export const SmartLinkingSettings = ( {
	disabled = false,
	selectedBlock,
	onSettingChange,
}: Readonly<SmartLinkingSettingsProps> ): React.JSX.Element => {
	const toggleGroupRef = useRef<HTMLDivElement>();
	const [ hint, setHint ] = useState<string|null>( '' );
	const [ animationIsRunning, setAnimationIsRunning ] = useState<boolean>( false );
	const [ , setForceUpdate ] = useState<boolean>( false );

	const selectedBlockId = selectedBlock?.clientId;

	/**
	 * Gets the settings from the Smart Linking store.
	 *
	 * @since 3.14.0
	 */
	const {
		maxLinks,
		fullContent,
		alreadyClicked,
		applyTo,
	} = useSelect( ( select ) => {
		const { getMaxLinks, isFullContent, wasAlreadyClicked, getApplyTo } = select( SmartLinkingStore );

		return {
			maxLinks: getMaxLinks(),
			fullContent: isFullContent(),
			alreadyClicked: wasAlreadyClicked(),
			applyTo: getApplyTo(),
		};
	}, [] );

	const {
		setMaxLinks,
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
	 * @since 3.16.2 Moved to a state to handle the selected block change.
	 */
	const [ applyToValue, setApplyToValue ] = useState<string>( applyTo as string ?? ( selectedBlockId ? 'selected' : 'all' ) );

	/**
	 * Sets the value of the ToggleGroupControl based on the selected block.
	 *
	 * If the selected block is not allowed, it sets the value to 'all'.
	 *
	 * @since 3.16.2
	 */
	useEffect( () => {
		if ( applyToValue === 'selected' && selectedBlock?.name && ! ALLOWED_BLOCKS.includes( selectedBlock.name ) ) {
			setApplyToValue( 'all' );
		} else {
			setApplyToValue( applyTo as string ?? ( selectedBlockId ? 'selected' : 'all' ) );
		}
	}, [ applyTo, selectedBlock?.name, selectedBlockId ] ); // eslint-disable-line react-hooks/exhaustive-deps

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

		/**
		 * Moves the button to the 'all' position and shows a hint to the user.
		 *
		 * @since 3.14.3
		 * @since 3.16.2 Added the 'hintText' parameter and made it async.
		 *
		 * @param {string} hintText The hint text to show to the user.
		 */
		const moveButtonAndShowHint = async ( hintText: string ) => {
			// Do not move the button if the interaction is disabled.
			if ( disabled ) {
				return;
			}

			// If the button changing animation is running, wait for it to finish.
			if ( animationIsRunning ) {
				await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );
			}

			if ( applyTo === ApplyToOptions.Selected ) {
				setTimeout( () => {
					setHint( hintText );
				}, 100 );
			}
			setApplyTo( null );
			setApplyToValue( 'all' );

			// Force update to re-render the ToggleGroupControl.
			setForceUpdate( ( force ) => ! force );
		};

		// If there isn't a selected block, move the focus to the
		// "All Blocks" button and set the hint to the user.
		if ( ! selectedBlock && applyTo !== ApplyToOptions.All ) {
			moveButtonAndShowHint( __( 'Select a block to apply Smart Links.', 'wp-parsely' ) );
		}

		// If the selected block is not allowed, move the focus to the
		// "All Blocks" button and set the hint to the user.
		if ( selectedBlock && applyTo !== ApplyToOptions.All && ! ALLOWED_BLOCKS.includes( selectedBlock.name ) ) {
			const blockName = getBlockType( selectedBlock.name )?.title ?? selectedBlock.name;
			/* translators: %s: block name */
			moveButtonAndShowHint( sprintf( __( '%s blocks are not supported for Smart Links.', 'wp-parsely' ), blockName ) );
		}

		setFullContent( ApplyToOptions.All === applyToValue );
	}, [ animationIsRunning, applyTo, applyToValue, disabled, selectedBlock, selectedBlockId, setApplyTo, setFullContent, setHint ] );

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
		if ( toggleGroupRef.current && applyToValue && ! alreadyClicked && selectedBlockId ) {
			const targetButton = toggleGroupRef.current.querySelector( `button[data-value="${ applyToValue }"]` ) as HTMLButtonElement;
			if ( targetButton && targetButton.getAttribute( 'aria-checked' ) !== 'true' ) {
				setApplyTo( applyToValue as ApplyToOptions );
				// Flag that the button was already set as it's only needed on the first time.
				setAlreadyClicked( true );
			}
		}
	}, [ selectedBlockId, fullContent, disabled, applyTo ] ); // eslint-disable-line

	/**
	 * Resets the hint when the selected block changes.
	 *
	 * @since 3.14.0
	 * @since 3.14.3 Moved from 'component.tsx' to 'component-settings.tsx'.
	 */
	useEffect( () => {
		setHint( null );
	}, [ selectedBlockId ] );

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
				</div>
			</div>
		</div>
	);
};
