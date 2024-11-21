import type { HTMLInputTypeAttribute } from "react";
import { getMyMicrosoftTeams, getTeam } from "@/services/backend";

export const config: FriskConfig = {
	metadata: [
		{
			key: "team",
			type: "select",
			displayName: "Ansvarlig team for denne funksjonen?",
			getOptions: async () => {
				const teams = await getMyMicrosoftTeams();
				return teams.map((team) => ({
					name: team.displayName,
					value: team.id,
				}));
			},
			getValue: async (value: string) => {
				const team = await getTeam(value);
				return team.displayName;
			},
			selectMode: "multi",
			showOn: "createAndUpdate",
			isRequired: true,
			placeholder: "Velg team",
			inheritFromParent: true,
		},
		{
			key: "backstage-url",
			type: "url",
			displayName: "Lenke til utviklerportalen",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "Sett inn lenke",
			inheritFromParent: false,
		},
	],
};

type FriskConfig = {
	metadata: Metadata[];
};

type GeneralMetadataContent = {
	key: string;
	displayName: string;
	inheritFromParent: boolean;
	getValue?: (key: string, value: string) => Promise<string>;
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
