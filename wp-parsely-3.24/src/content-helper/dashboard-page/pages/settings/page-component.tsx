import { PageBody, PageContainer, PageHeader } from '../../components';

/**
 * Settings page component.
 *
 * @since 3.19.0
 */
export const SettingsPage = (): React.JSX.Element => {
	return (
		<PageContainer name="settings">
			<PageHeader>
				<h1>Parse.ly Settings</h1>
			</PageHeader>
			<PageBody>
				<p>This is a page for settings.</p>
			</PageBody>
		</PageContainer>
	);
};
