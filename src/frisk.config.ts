import type { HTMLInputTypeAttribute } from "react";

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
			placeholder: "velg team",
		},
		{
			key: "name",
			type: "text",
			displayName: "Name",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "skriv inn navn",
		},
		{
			key: "money",
			type: "number",
			displayName: "Money",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "skriv inn cash",
		},
		{
			key: "lenke",
			type: "url",
			displayName: "Lenke",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "skriv inn lenke",
		},
	],
};

type FriskConfig = {
	metadata: Metadata[];
};

type GeneralMetadataContent = {
	key: string;
	displayName: string;
};

type GeneralRequiredMetadata = GeneralMetadataContent & {
	isRequired: true;
	showOn: "createAndUpdate";
};

type GeneralOptionalMetadata = GeneralMetadataContent & {
	isRequired: false;
	showOn: "update" | "createAndUpdate";
};

type GeneralMetadata = GeneralRequiredMetadata | GeneralOptionalMetadata;

export type SelectMetadata = GeneralMetadata & {
	getOptions: () => Promise<SelectOption[]>;
	selectMode: "single" | "multi";
	type: "select";
	placeholder: string;
};

export type InputMetadata = GeneralMetadata & {
	type: Extract<HTMLInputTypeAttribute, "number" | "text" | "url">;
	placeholder: string;
};

type Metadata = SelectMetadata | InputMetadata;

type SelectOption = { value: string; name: string };
