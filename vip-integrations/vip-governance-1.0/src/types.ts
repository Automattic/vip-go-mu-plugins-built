export type BlockName = string;
export type ClientId = string;

export type BlockSettings = Record< string, unknown >;

export interface GovernanceRules {
	allowedBlocks: BlockName[];
	allowedFeatures?: string[];
	blockSettings?: BlockSettings;
}

export interface GovernanceRuntimeConfig {
	error: false | string;
	governanceRules: GovernanceRules;
	nestedSettings: BlockSettings;
	urlSettingsPage: string;
}

export interface BlockEditorSelectors {
	getBlockName: ( clientId: ClientId ) => BlockName | undefined;
	getBlockParents: ( clientId: ClientId, ascending?: boolean ) => ClientId[];
}

export interface BlockRecord {
	clientId: ClientId;
	name: BlockName;
}

export interface BlockEditorInsertionSelectors extends BlockEditorSelectors {
	getBlock: ( clientId: ClientId ) => BlockRecord | null;
}

export interface BlockType {
	name: BlockName;
}

declare global {
	const VIP_GOVERNANCE: GovernanceRuntimeConfig;
}
