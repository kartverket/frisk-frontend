import type { HTMLInputTypeAttribute } from "react";
import {
	getFunctionMetadata,
	getFunctions,
	getMyMicrosoftTeams,
	getTeam,
} from "@/services/backend";

export const config: FriskConfig = {
	metadata: [
		{
			key: "team",
			type: "select",
			label: "Ansvarlig team for denne funksjonen?",
			getOptions: async () => {
				const teams = await getMyMicrosoftTeams();
				return teams.map((team) => ({
					name: team.displayName,
					value: team.id,
				}));
			},
			getDisplayValue: async (input) => {
				const team = await getTeam(input.value);
				return team.displayName;
			},
			selectMode: "single",
			showOn: "createAndUpdate",
			isRequired: true,
			placeholder: "Velg team",
			inheritFromParent: true,
		},
		{
			key: "backstage-url",
			type: "url",
			label: "Lenke til utviklerportalen",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "Sett inn lenke",
			inheritFromParent: false,
		},
		{
			key: "dependencies",
			type: "select",
			label: "Velg andre funksjoner denne funksjonen er avhengig avv",
			getOptions: async () => {
				const functions = await getFunctions();
				return functions.map((func) => ({
					name: func.name,
					value: String(func.id),
				}));
			},
			// getDisplayValue: async (input) => {
			// 	const functionId: number = Number.parseInt(input.key);
			// 	const metadata = await getFunctionMetadata(functionId);
			// 	const dependencies = metadata?.filter((m) => m.key === "dependencies");
			// 	return dependencies.map((m) => {
			// 		m.value;
			// 	});
			// },
			selectMode: "multi",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "Søk etter funksjoner",
			inheritFromParent: true,
		},
	],
};

type FriskConfig = {
	metadata: Metadata[];
};

type GeneralMetadataContent = {
	key: string;
	label: string;
	inheritFromParent: boolean;
	getDisplayValue?: (input: { key: string; value: string }) => Promise<
		string | string[]
	>;
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

export type SelectOption = { value: string; name: string };
