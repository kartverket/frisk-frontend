export const config: FriskConfig = {
	metadata: [
		{
			key: "team",
			type: "select",
			displayName: "Team",
			getOptions: async () => {
				return [
					{ value: "team1", name: "team1!" },
					{ value: "team2", name: "team2!" },
				];
			},
			selectMode: "multi",
			showOn: "createAndUpdate",
			isRequired: false,
		},
	],
};

type FriskConfig = {
	metadata: SelectMetadata[];
};

type GeneralMetadata = {
	key: string;
	type: MetadataType;
	displayName: string;
};

type MetadataType = "select";

type GeneralRequiredMetadata = GeneralMetadata & {
	isRequired: true;
	showOn: "createAndUpdate";
};

type GeneralOptionalMetadata = GeneralMetadata & {
	isRequired: false;
	showOn: "update" | "createAndUpdate";
};

type Metadata = GeneralRequiredMetadata | GeneralOptionalMetadata;

export type SelectMetadata = Metadata & {
	getOptions: () => Promise<SelectOption[]>;
	selectMode: "single" | "multi";
};

type SelectOption = { value: string; name: string };
