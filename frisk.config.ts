import type { HTMLInputTypeAttribute } from "react";
import {
	getFunction,
	getFunctions,
	getMyMicrosoftTeams,
	getTeam,
} from "@/services/backend";
import { getregelrettFrontendUrl } from "@/config";

export const config: FriskConfig = {
	metadata: [
		{
			key: "team",
			type: "select",
			title: "Team",
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
				return { displayValue: team.displayName };
			},
			selectMode: "single",
			showOn: "createAndUpdate",
			isRequired: true,
			placeholder: "Velg team",
			inheritFromParent: true,
		},
		{
			key: "kritikalitet",
			type: "select",
			title: "Kritikalitet",
			label: "Kritikalitet",
			inheritFromParent: false,
			isRequired: false,
			showOn: "createAndUpdate",
			selectMode: "single",
			getOptions: async () => {
				return [
					{ value: "Høy", name: "Høy" },
					{ value: "Middels", name: "Middels" },
					{ value: "Lav", name: "Lav" },
				];
			},
			placeholder: "Velg kritikalitet",
		},
		{
			key: "backstage-url",
			type: "url",
			title: "Lenke til utviklerportalen",
			isExternal: true,
			label: "Lenke til utviklerportalen",
			showOn: "createAndUpdate",
			isRequired: false,
			placeholder: "Sett inn lenke",
			inheritFromParent: false,
			getDisplayValue: async () => {
				return { displayValue: "Utviklerportalen" };
			},
		},
		{
			key: "rr-skjema",
			type: "text",
			title: "Skjema",
			label: "Regelrett skjema",
			showOn: "readOnly",
			isRequired: false,
			placeholder: "Sett inn skjema",
			inheritFromParent: false,
			isDeletable: true,
			getDisplayValue: async (input) => {
				const [contextId, tableName, __] = input.value.split(":splitTarget:");
				const searchParams = new URLSearchParams({
					redirectBackUrl: window.location.href,
					redirectBackTitle: "Funksjonsregisteret",
				});
				const url = `${getregelrettFrontendUrl()}/context/${contextId}?${searchParams.toString()}`;
				return {
					displayValue: tableName.replaceAll("+", " "),
					value: url,
					displayOptions: {
						type: "url",
						isExternal: false,
					},
				};
			},
		},
		{
			key: "dependencies",
			type: "select",
			title: "Funksjonsavhengigheter",
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
				return { displayValue: func.name, displayOptions: { type: "pill" } };
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
	enableEntra: true,
};

type FriskConfig = {
	metadata?: Metadata[];
	logo: Logo;
	title: string;
	description: string;
	rootNodeName: string;
	columnName: string;
	addButtonName: string;
	enableEntra?: boolean;
};

type GeneralMetadataContent = {
	key: string;
	label: string;
	title?: string;
	inheritFromParent: boolean;

	/**
	 * Get the display value that will be used when rendering the metadata.
	 * Visual only
	 *
	 * @param input The key and value of the metadata
	 * @returns
	 * The display value that will be used when rendering the metadata.
	 * I.e. if the value is an id, but you want do display the name of the thing that the id refers to,
	 * you can use this function to get the display value. Often used together with inputType: "select" since
	 * selects has both a value, and a name.
	 */
	getDisplayValue?: (input: { key: string; value: string }) => Promise<{
		displayValue: string;
		value?: string;
		displayOptions?:
			| {
					type: "text";
			  }
			| {
					type: "pill";
			  }
			| {
					type: "url";
					isExternal: boolean;
			  };
	}>;
};

type GeneralRequiredMetadata = GeneralMetadataContent & {
	isRequired: true;
	showOn: "createAndUpdate";
};

type GeneralOptionalMetadata = GeneralMetadataContent & {
	isRequired: false;
	showOn: "update" | "createAndUpdate";
};

type ReadOnlyMetadata = GeneralMetadataContent & {
	isRequired: false;
	showOn: "readOnly";
	isDeletable: boolean;
};

type GeneralMetadata =
	| GeneralRequiredMetadata
	| GeneralOptionalMetadata
	| ReadOnlyMetadata;

export type SelectMetadata = GeneralMetadata & {
	getOptions: () => Promise<SelectOption[]>;
	selectMode: "single" | "multi";
	type: "select";
	placeholder: string;
};

export type InputMetadata = GeneralMetadata &
	(
		| {
				type: Extract<HTMLInputTypeAttribute, "number" | "text">;
				placeholder: string;
		  }
		| {
				type: "url";
				placeholder: string;
				isExternal: boolean;
		  }
	);

export type Metadata = SelectMetadata | InputMetadata;

export type SelectOption = { value: string; name: string };

type Logo = {
	imageSource: string;
	logoLink?: string;
};
