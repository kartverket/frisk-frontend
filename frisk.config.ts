import type { HTMLInputTypeAttribute } from "react";
import { getMyMicrosoftTeams, getTeam } from "@/services/backend";
import { getregelrettFrontendUrl } from "@/config";

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
				return { displayValue: team.displayName };
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
			label: "Regelrett skjema",
			showOn: "readOnly",
			isRequired: false,
			placeholder: "Sett inn skjema",
			inheritFromParent: false,
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
	],
};

type FriskConfig = {
	metadata?: Metadata[];
};

type GeneralMetadataContent = {
	key: string;
	label: string;
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
	showOn: "update" | "createAndUpdate" | "readOnly";
};

type GeneralMetadata = GeneralRequiredMetadata | GeneralOptionalMetadata;

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
