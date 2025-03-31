import { SnackbarList } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	store as noticesStore,
	NoticeStoreActions,
	NoticeStoreSelectors,
	WPNotice,
} from '@wordpress/notices';

const Notices = () => {
	const { removeNotice } = useDispatch< NoticeStoreActions >( noticesStore );
	const notices = useSelect< NoticeStoreSelectors, WPNotice[] >(
		select => select( noticesStore ).getNotices(),
		[]
	);

	if ( notices.length === 0 ) {
		return null;
	}

	return (
		<SnackbarList
			notices={ notices }
			onRemove={ notice => {
				removeNotice( notice );
			} }
		/>
	);
};

export default Notices;
