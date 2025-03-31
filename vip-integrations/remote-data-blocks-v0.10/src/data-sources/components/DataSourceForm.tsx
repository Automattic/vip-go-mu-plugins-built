import {
	Button,
	ExternalLink,
	Icon,
	IconType,
	VisuallyHidden,
	__experimentalInputControl as InputControl,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	ToggleControl,
} from '@wordpress/components';
import { Children, createPortal, isValidElement, useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { lockSmall } from '@wordpress/icons';

import { DataSourceFormActions } from './DataSourceFormActions';
import { useDataSources } from '../hooks/useDataSources';
import { useSettingsContext } from '@/settings/hooks/useSettingsNav';

interface DataSourceFormProps {
	children: React.ReactNode;
	onSave: () => Promise< void >;
}

interface DataSourceFormSetupProps {
	children: React.ReactNode;
	canProceed: boolean;
	displayName: string;
	handleOnChange: ( key: string, value: string ) => void;
	heading:
		| {
				label: string;
				icon?: never;
				width?: never;
				height?: never;
				verticalAlign?: never;
		  }
		| {
				label?: never;
				icon: IconType;
				width: string;
				height: string;
				verticalAlign?: string;
		  };
	inputIcon: IconType;
	newUUID?: string | null;
	setNewUUID?: ( uuid: string | null ) => void;
	uuid?: string;
}

const DataSourceFormStep = ( {
	children,
	heading,
	subheading,
}: {
	children: React.ReactNode;
	heading: React.ReactNode;
	subheading?: React.ReactNode;
} ) => (
	<>
		<h2 className="rdb-settings_form-heading">{ heading }</h2>
		<h3 className="rdb-settings_form-subheading">{ subheading }</h3>
		<fieldset className="rdb-settings_form-fields">{ children }</fieldset>
	</>
);

const DataSourceForm = ( { children, onSave }: DataSourceFormProps ) => {
	const [ currentStep, setCurrentStep ] = useState( 1 );
	const { goToMainScreen, screen } = useSettingsContext();
	const { canUseDisplayName } = useDataSources();

	const steps = Children.toArray( children );
	const singleStep = steps.length === 1 || screen === 'editDataSource';

	const stepHeadings = [ __( 'Setup' ) ]; // First step is always Setup

	if (
		steps.some(
			child =>
				isValidElement( child ) && ( child.type === DataSourceForm.Scope || child.type === 'Scope' )
		)
	) {
		stepHeadings.push( __( 'Scope' ) );
	}

	if (
		steps.some(
			child =>
				isValidElement( child ) &&
				( child.type === DataSourceForm.Blocks || child.type === 'Blocks' )
		)
	) {
		stepHeadings.push( __( 'Blocks' ) );
	}

	const canProceedToNextStep = () => {
		const step = steps[ currentStep - 1 ];
		if ( ! isValidElement< { canProceed?: boolean; displayName: string; uuid: string } >( step ) ) {
			return false;
		}
		const { canProceed, displayName, uuid } = step.props;
		const isBlocksStep = step.type === DataSourceForm.Blocks;
		const noConflicts =
			Boolean( canProceed ) && ( currentStep !== 1 || canUseDisplayName( displayName, uuid ) );

		return isBlocksStep || noConflicts;
	};

	const handleNextStep = () => {
		if ( canProceedToNextStep() ) {
			setCurrentStep( currentStep + 1 );
		}
	};

	return (
		<>
			<div
				className={ `rdb-settings-page_data-source-${
					singleStep ? 'single-step' : 'multi-step'
				}-form rdb-settings-page_data-source-${
					screen === 'addDataSource' ? 'add' : 'edit'
				}-form` }
			>
				{ ! singleStep && (
					<nav className="rdb-settings_form-steps" aria-label="Setup form steps">
						<ol>
							{ stepHeadings.map( ( label, index ) => {
								const stepNumber = index + 1;
								return (
									<li
										key={ stepNumber }
										aria-current={ currentStep === stepNumber ? 'step' : undefined }
										className={ currentStep === stepNumber ? 'current-step' : '' }
									>
										{ label }
									</li>
								);
							} ) }
						</ol>
					</nav>
				) }
				<form className="rdb-settings-page_data-source-form">
					{ singleStep ? steps.map( step => step ) : steps[ currentStep - 1 ] }
				</form>
				{ screen === 'editDataSource' && (
					<>
						{ createPortal(
							<DataSourceFormActions
								onSave={ onSave }
								isSaveDisabled={ ! canProceedToNextStep() }
							/>,
							document.getElementById( 'rdb-settings-page-form-save-button' ) ||
								document.createElement( 'div' )
						) }
					</>
				) }
			</div>
			{ screen === 'addDataSource' && currentStep === 1 && (
				<div className="rdb-settings-page_data-source-form-setup-info">
					<Icon icon={ lockSmall } />
					<p>
						{ __(
							'Connecting to an external source will not store the data. We issue queries to the database, but all your data stays with the provider. '
						) }
						<ExternalLink href="https://remotedatablocks.com/">
							{ __( 'Learn more', 'remote-data-blocks' ) }
						</ExternalLink>
					</p>
				</div>
			) }
			{ screen === 'addDataSource' && (
				<div className="rdb-settings-page_data-source-form-footer">
					<div className="rdb-settings-page_data-source-form-setup-actions">
						{ currentStep === 1 && (
							<Button onClick={ () => goToMainScreen() } variant="secondary" __next40pxDefaultSize>
								Cancel
							</Button>
						) }
						{ currentStep > 1 && (
							<Button
								onClick={ () => setCurrentStep( currentStep - 1 ) }
								variant="secondary"
								__next40pxDefaultSize
							>
								Go back
							</Button>
						) }
						{ currentStep < steps.length && (
							<Button
								onClick={ handleNextStep }
								variant="primary"
								__next40pxDefaultSize
								disabled={ ! canProceedToNextStep() }
							>
								Continue
							</Button>
						) }
						{ currentStep === steps.length && (
							<DataSourceFormActions
								onSave={ onSave }
								isSaveDisabled={ ! canProceedToNextStep() }
							/>
						) }
					</div>
				</div>
			) }
		</>
	);
};

const DataSourceFormSetup = ( {
	canProceed,
	children,
	displayName: initialDisplayName,
	handleOnChange,
	heading,
	inputIcon,
	uuid,
}: DataSourceFormSetupProps ) => {
	const { screen, service } = useSettingsContext();
	const { canUseDisplayName } = useDataSources();

	const [ displayName, setDisplayName ] = useState( initialDisplayName );
	const [ errors, setErrors ] = useState< Record< string, string > >( {} );

	const { icon, height, label, width, verticalAlign } = heading;

	const onDisplayNameChange = ( displayNameInput: string | undefined ) => {
		setErrors( {} );
		const sanitizedDisplayName = displayNameInput
			?.toString()
			.trim()
			.replace( /[^a-zA-Z0-9-_ ]/g, '' );
		setDisplayName( sanitizedDisplayName ?? '' );
		handleOnChange( 'display_name', sanitizedDisplayName ?? '' );
	};

	const validateDisplayName = () => {
		const hasConflict = ! canUseDisplayName( displayName, uuid ?? '' );

		if ( ! displayName.trim() ) {
			setErrors( {
				displayName: __( 'Please provide a name for your data source.', 'remote-data-blocks' ),
			} );
		} else if ( hasConflict ) {
			setErrors( {
				displayName: sprintf(
					__(
						'Data source "%s" already exists. Please choose another name.',
						'remote-data-blocks'
					),
					displayName
				),
			} );
		} else {
			setErrors( {} );
		}
	};

	useEffect( () => {
		if ( canProceed || ( displayName === '' && screen === 'editDataSource' ) ) {
			validateDisplayName();
		}
	}, [ canProceed, displayName ] );

	return (
		<DataSourceFormStep
			heading={
				screen === 'addDataSource' && service ? (
					<span style={ { marginBottom: '48px' } }>
						{ label ? (
							__( label, 'remote-data-blocks' )
						) : (
							<>
								{ __( 'Connect with ', 'remote-data-blocks' ) }
								<Icon
									icon={ icon }
									style={ {
										width,
										height,
										marginLeft: '4px',
										verticalAlign: verticalAlign ?? 'text-bottom',
									} }
								/>
								<VisuallyHidden>{ __( service, 'remote-data-blocks' ) }</VisuallyHidden>
							</>
						) }
					</span>
				) : (
					<>{ __( 'Setup' ) }</>
				)
			}
			subheading={
				screen === 'editDataSource'
					? __( 'Manage the source’s visibility and connection details.', 'remote-data-blocks' )
					: undefined
			}
		>
			<InputControl
				autoComplete="off"
				// prevent 1password suggestions since they ignore autocomplete
				data-1p-ignore
				className={ `rdb-settings-page_data-source-form-input ${
					errors.displayName ? 'has-error' : ''
				}   ` }
				help={
					<span>
						{ errors.displayName
							? errors.displayName
							: __( 'Only visible to you and other site managers. ', 'remote-data-blocks' ) }
					</span>
				}
				label={ __( 'Data Source Name' ) }
				onChange={ onDisplayNameChange }
				onBlur={ validateDisplayName }
				value={ displayName }
				prefix={
					screen === 'editDataSource' ? (
						<InputControlPrefixWrapper style={ { paddingRight: '4px' } }>
							<Icon icon={ inputIcon } style={ { verticalAlign: 'text-bottom' } } />
						</InputControlPrefixWrapper>
					) : null
				}
				required
				__next40pxDefaultSize
			/>

			{ children }
		</DataSourceFormStep>
	);
};

const DataSourceFormScope = ( {
	children,
	...props
}: {
	children: React.ReactNode;
	canProceed: boolean;
} ) => {
	const { service } = useSettingsContext();
	return (
		<DataSourceFormStep
			heading={ __( 'Scope' ) }
			subheading={ __(
				`Choose what data should be pulled from ${ service ?? 'your data source' } to your site.`
			) }
			{ ...props }
		>
			{ children }
		</DataSourceFormStep>
	);
};

const DataSourceFormBlocks = ( {
	handleOnChange,
	hasEnabledBlocks,
}: {
	handleOnChange: ( key: string, value: boolean ) => void;
	hasEnabledBlocks: boolean;
} ) => {
	const handleToggle = () => {
		handleOnChange( 'enable_blocks', ! hasEnabledBlocks );
	};
	return (
		<DataSourceFormStep
			heading={ __( 'Set up blocks' ) }
			subheading={
				<>
					{ __( 'Enable or disable the auto-generation of remote data container blocks. ' ) }
					<ExternalLink href="https://remotedatablocks.com/docs/extending/block-registration/">
						{ __( 'Learn more', 'remote-data-blocks' ) }
					</ExternalLink>
				</>
			}
		>
			<ToggleControl
				checked={ hasEnabledBlocks }
				help={
					hasEnabledBlocks
						? __(
								'Turning this off will require you to implement your own configuration code in your site.',
								'remote-data-blocks'
						  )
						: __(
								'Turning this on will automatically generate blocks for your site.',
								'remote-data-blocks'
						  )
				}
				label={ __( 'Auto-generate blocks' ) }
				onChange={ handleToggle }
			/>
		</DataSourceFormStep>
	);
};

DataSourceForm.Setup = DataSourceFormSetup;
DataSourceForm.Scope = DataSourceFormScope;
DataSourceForm.Blocks = DataSourceFormBlocks;

export { DataSourceForm };
