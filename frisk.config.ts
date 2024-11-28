import type { HTMLInputTypeAttribute } from "react";
import {
	getFunction,
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
			getDisplayValue: async () => {
				return "Utviklerportalen";
			},
		},
		{
			key: "dependencies",
			type: "select",
			label: "Velg andre funksjoner denne funksjonen er avhengig av",
			getOptions: async () => {
				const functions = await getFunctions();
				return functions.map((func) => ({
					name: func.name,
					value: String(func.id),
				}));
			},
			getDisplayValue: async (input) => {
				const functionId = Number.parseInt(input.value);
				const func = await getFunction(functionId);
				return func.name;
			},
			selectMode: "multi",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "Søk etter funksjoner",
			inheritFromParent: false,
		},
	],
	logo: {
		imageSource: "/logo.svg",
	},
	title: "Funksjonsregisteret",
	description:
		"Smell opp noen bra funksjoner og få den oversikten du fortjener",
	rootNodeName: "Kartverket",
	columnName: "Funksjon",
	addButtonName: "Legg til funksjon",
};

type FriskConfig = {
	metadata: Metadata[];
	logo: Logo;
	title: string;
	description: string;
	rootNodeName: string;
	columnName: string;
	addButtonName: string;
};

type GeneralMetadataContent = {
	key: string;
	label: string;
	inheritFromParent: boolean;
	getDisplayValue?: (input: { key: string; value: string }) => Promise<string>;
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

type Logo = {
	imageSource: string;
	logoLink?: string;
};
