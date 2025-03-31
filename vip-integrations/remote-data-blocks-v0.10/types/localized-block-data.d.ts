type RemoteDataBinding = Pick< RemoteDataResultFields, 'name' | 'type' >;
type AvailableBindings = Record< string, RemoteDataBinding >;

/**
 * This corresponds directly to the input schema defined by a query.
 */
interface InputVariable {
	/** The display friendly name of the variable */
	name?: string;
	/** Whether the variable is required, or not in the query */
	required: boolean;
	/** The slug of the variable in the query */
	slug: string;
	/** The type of the variable in the query */
	type: string;
}

interface InputVariableOverride {
	display_name?: string;
	help_text?: string;
	name: string;
}

interface BlockConfig {
	availableBindings: AvailableBindings;
	availableOverrides: InputVariableOverride[];
	dataSourceType: string;
	instructions?: string;
	loop: boolean;
	name: string;
	patterns: {
		default: string;
		inner_blocks?: string;
	};
	selectors: {
		image_url?: string;
		inputs: InputVariable[];
		name: string;
		query_key: string;
		type: string;
	}[];
	settings: {
		category: string;
		description?: string;
		icon?: ReactElement | IconType | ComponentType;
		title: string;
	};
}

interface BlocksConfig {
	[ blockName: string ]: BlockConfig;
}

interface LocalizedBlockData {
	config: BlocksConfig;
	rest_url: string;
	tracks_global_properties?: TracksGlobalProperties;
}
