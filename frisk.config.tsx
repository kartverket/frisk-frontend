import { useState } from "react";
import {
	getFunction,
	getFunctions,
	getMyMicrosoftTeams,
	getTeam,
} from "@/services/backend";
import { getRegelrettClientId, getregelrettFrontendUrl } from "@/config";
import { object, string, array, type z } from "zod";
import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	IconButton,
	Link,
	Select,
	useDisclosure,
} from "@kvib/react";
import type { useFunction } from "@/hooks/use-function";
import { msalInstance } from "@/services/msal";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useMetadata } from "@/hooks/use-metadata";
import { DeleteMetadataModal } from "@/components/delete-metadata-modal";

export async function getConfig(): Promise<FriskConfig> {
	const schemas = await getSchemasFromRegelrett();
	return {
		metadata: [
			{
				key: "team",
				type: "select",
				title: "Team",
				displayName: "Team",
				label: "Ansvarlig team for denne funksjonen?",
				getOptions: async () => {
					const teams = await getMyMicrosoftTeams();
					return teams.map((team) => ({
						name: team.displayName,
						value: team.id,
					}));
				},
				onChange: async (input) => {
					const { metadata } = useMetadata(input.functionId);

					if (!metadata.data) return;

					const metaMap = new Map(
						metadata.data.map((meta) => [meta.key, meta.value]),
					);

					const matchingSchemas = schemas.filter((schema) =>
						metaMap.has(schema.id),
					);

					await Promise.all(
						matchingSchemas.map((schema) =>
							changeFormTeam({
								// biome-ignore lint/style/noNonNullAssertion: <explanation>
								contextId: metaMap.get(schema.id)!,
								teamId: input.value,
							}),
						),
					);
				},
				getDisplayValue: async (input) => {
					const team = await getTeam(input.value);
					return { displayValue: team.displayName };
				},
				selectMode: "single",
				show: () => true,
				isRequired: true,
				placeholder: "Velg team",
				inheritFromParent: true,
			},
			{
				key: "beskrivelse",
				type: "text",
				textArea: true,
				title: "Beskrivelse",
				displayName: "Beskrivelse",
				label: "Funksjonsbeskrivelse",
				show: () => true,
				isRequired: false,
				placeholder: "Legg til en beskrivelse",
				inheritFromParent: false,
				getDisplayValue: async (input) => {
					return { displayValue: input.value };
				},
			},
			{
				key: "kritikalitet",
				type: "select",
				title: "Kritikalitet",
				displayName: "Kritikalitet",
				label: "Kritikalitet",
				inheritFromParent: false,
				isRequired: false,
				show: () => true,
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
				displayName: "Lenke til utviklerportalen",
				isExternal: true,
				label: "Lenke til utviklerportalen",
				show: () => true,
				isRequired: false,
				placeholder: "Sett inn lenke",
				inheritFromParent: false,
				getDisplayValue: async () => {
					return { displayValue: "Utviklerportalen" };
				},
			},
			{
				key: "dependencies",
				type: "select",
				title: "Funksjonsavhengigheter",
				displayName: "Funksjonsavhengigheter",
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
				show: () => true,
				isRequired: false,
				placeholder: "Søk etter funksjoner",
				inheritFromParent: false,
			},
			...schemas.map(
				(schema): InputMetadata => ({
					key: schema.id,
					type: "text",
					textArea: false,
					displayName: schema.name,
					label: "Regelrett skjema",
					show: (mode, hasAccess) => mode === "read" && hasAccess,
					isRequired: false,
					placeholder: "Sett inn skjema",
					inheritFromParent: false,
					getDisplayValue: async (input) => {
						const contextId = input.value;
						const searchParams = new URLSearchParams({
							redirectBackUrl: window.location.href,
							redirectBackTitle: "Funksjonsregisteret",
						});
						const url = `${getregelrettFrontendUrl()}/context/${contextId}?${searchParams.toString()}`;
						return {
							displayValue: "Skjema",
							displayOptions: {
								type: "custom",
								component: (
									<SchemaDisplay
										key={contextId}
										schema={schema}
										url={url}
										functionId={input.functionId}
										metadataId={input.id}
									/>
								),
							},
						};
					},
				}),
			),
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
		functionCardComponents: [createSchemaComponent(schemas)],
	};
}

type FriskConfig = {
	metadata?: Metadata[];
	logo: Logo;
	title: string;
	description: string;
	rootNodeName: string;
	columnName: string;
	addButtonName: string;
	enableEntra?: boolean;
	functionCardComponents: React.FC<FunctionCardComponentProps>[];
};

type GeneralMetadataContent = {
	key: string;

	/**
	 * Is showed over the input field
	 */
	label: string;

	/**
	 * Is showed above the value on a selected card
	 */
	title?: string;

	/**
	 * Is showed instead of the key in e.g. the filter dropdown.
	 */
	displayName?: string;

	/**
	 * When creating a new function, should the metadata be inherited from the parent function?
	 */
	inheritFromParent: boolean;

	isRequired: boolean;
	show: (mode: "create" | "update" | "read", hasAccess: boolean) => boolean;

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
	getDisplayValue?: (input: {
		key: string;
		value: string;
		functionId: number;
		id: number;
	}) => Promise<{
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
			  }
			| {
					type: "custom";
					component: React.ReactNode;
			  };
	}>;
	onChange?: (input: {
		key: string;
		value: string;
		functionId: number;
		id: number;
	}) => void;
};

type GeneralRequiredMetadata = GeneralMetadataContent;

type GeneralOptionalMetadata = GeneralMetadataContent;

type ReadOnlyMetadata = GeneralMetadataContent;

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
				type: "number";
				placeholder: string;
		  }
		| {
				type: "text";
				textArea: boolean;
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

type FunctionCardComponentProps = {
	func: ReturnType<typeof useFunction>["func"];
	metadata: ReturnType<typeof useMetadata>["metadata"];
	addMetadata: ReturnType<typeof useMetadata>["addMetadata"];
};

function createSchemaComponent(schemas: RegelrettSchema[]) {
	return ({ func, metadata, addMetadata }: FunctionCardComponentProps) => {
		const [selectedSchema, setSelectedSchema] = useState("");
		const availableSchemas = schemas.filter(
			(schema) => !metadata.data?.find((m) => m.key === schema.id),
		);
		return (
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					if (!func.data) return;
					const teamId = metadata.data?.find(
						(obj) => obj.key === "team",
					)?.value;
					if (!teamId) return;
					const schemaId = (
						e.currentTarget.elements.namedItem("schema") as HTMLSelectElement
					).value;
					const response = await createRegelrettContext({
						name: func.data.name,
						teamId: teamId,
						tableId: schemaId,
					});
					const contextId = response.id;
					addMetadata.mutateAsync({
						functionId: func.data.id,
						key: schemaId,
						value: contextId,
					});
				}}
			>
				<FormControl isRequired={true} style={{ width: "fit-content" }}>
					<FormLabel style={{ fontSize: "14px" }}>
						Opprett sikkerhetsskjema
					</FormLabel>
					<Select
						name="schema"
						onClick={(e) => e.stopPropagation()}
						onChange={(e) => setSelectedSchema(e.target.value)}
						placeholder="Velg sikkerhetsskjema"
						size={"sm"}
					>
						{availableSchemas.map((schema) => (
							<option key={schema.id} value={schema.id}>
								{schema.name}
							</option>
						))}
					</Select>
				</FormControl>
				<Button
					type="submit"
					variant="primary"
					colorScheme="blue"
					size="sm"
					width="fit-content"
					my="16px"
					onClick={(e) => e.stopPropagation()}
					isDisabled={!selectedSchema}
				>
					Opprett skjema
				</Button>
			</form>
		);
	};
}

type Schema = {
	id: string;
	name: string;
};

type SchemaDisplayProps = {
	schema: Schema;
	url: string;
	functionId: number;
	metadataId: number;
};

function SchemaDisplay({
	schema,
	url,
	functionId,
	metadataId,
}: SchemaDisplayProps) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Flex width="90%" gap={2} alignItems="center">
			<Button
				colorScheme="blue"
				as={Link}
				href={url}
				isExternal={false}
				variant="secondary"
				borderRadius="md"
				backgroundColor="white"
				leftIcon="article"
				textDecoration="none"
				size="sm"
				onClick={(e) => e.stopPropagation()}
				overflow="hidden"
				fontWeight="medium"
				fontSize="sm"
				justifyContent="start"
				flex="1"
			>
				{schema.name}
			</Button>

			<IconButton
				aria-label="Delete schema"
				icon="delete"
				variant="tertiary"
				size="sm"
				colorScheme="red"
				borderRadius="md"
				_hover={{ backgroundColor: "red.50" }}
				onClick={(e) => {
					e.stopPropagation();
					onOpen();
				}}
			/>
			<DeleteMetadataModal
				onOpen={onOpen}
				onClose={onClose}
				isOpen={isOpen}
				functionId={functionId}
				metadataId={metadataId}
				displayValue={schema.name}
			/>
		</Flex>
	);
}

const REGELRETT_BACKEND_URL = `${getregelrettFrontendUrl()}/api`;

async function getSchemasFromRegelrett() {
	const response = await fetch(`${REGELRETT_BACKEND_URL}/schemas`);
	if (!response.ok) {
		throw new Error(`Backend error: ${response.status} ${response.statusText}`);
	}

	const json = await response.json();
	return array(RegelrettSchema).parse(json);
}

const RegelrettSchema = object({
	id: string(),
	name: string(),
});

type RegelrettSchema = z.infer<typeof RegelrettSchema>;

async function getRegelrettTokens() {
	const REGELRETT_CLIENT_ID = getRegelrettClientId();
	const regelrettScope =
		import.meta.env.MODE === "skip"
			? `api://${REGELRETT_CLIENT_ID}/regelrett`
			: "api://e9dc946b-6fef-44ab-82f1-c0ec2e402903/.default";

	const accounts = msalInstance.getAllAccounts();
	const account = accounts[0];
	if (!account) {
		throw new Error("No active account");
	}
	const tokenResponse = await msalInstance
		.acquireTokenSilent({
			scopes: [regelrettScope],
			account: account,
		})
		.catch((error) => {
			if (error instanceof InteractionRequiredAuthError) {
				return msalInstance.acquireTokenRedirect({
					scopes: [regelrettScope],
					account: account,
				});
			}
		});

	if (!tokenResponse) {
		throw new Error("No tokenResponse");
	}
	return tokenResponse;
}

async function fetchFromRegelrett(path: string, options: RequestInit = {}) {
	const tokens = await getRegelrettTokens();
	const response = await fetch(`${REGELRETT_BACKEND_URL}/${path}`, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${tokens.accessToken}`,
		},
	});
	if (!response.ok) {
		throw new Error(`Backend error: ${response.status} ${response.statusText}`);
	}
	return response;
}

export async function createRegelrettContext({
	name,
	teamId,
	tableId,
}: { name: string; teamId: string; tableId: string }) {
	const response = await fetchFromRegelrett("/contexts", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name,
			teamId,
			tableId,
		}),
	});

	const json = await response.json();
	return RegelrettContext.parse(json);
}

async function changeFormTeam({
	contextId,
	teamId,
}: { contextId: string; teamId: string }) {
	const response = await fetchFromRegelrett(`/contexts/${contextId}/team`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ teamId }),
	});

	if (!response.ok) {
		throw new Error(`Backend error: ${response.status} ${response.statusText}`);
	}
}

const RegelrettContext = object({
	id: string(),
});
