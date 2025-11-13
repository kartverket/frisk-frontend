import { useState } from "react";
import {
	getFunction,
	getFunctionMetadata,
	getFunctions,
	getMyMicrosoftTeams,
	getTeam,
} from "@/services/backend";
import { getRegelrettClientId, getregelrettFrontendUrl } from "@/config";
import { object, string, type z } from "zod";
import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Icon,
	IconButton,
	Link,
	Select,
	useDisclosure,
	Text,
	Tooltip,
} from "@kvib/react";
import { useFunctions } from "@/hooks/use-functions";
import { msalInstance } from "@/services/msal";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import type { useMetadata } from "@/hooks/use-metadata";
import { DeleteMetadataModal } from "@/components/delete-metadata-modal";
import type React from "react";
import { PillView } from "@/components/metadata/metadata-value";
import type { useFunction } from "@/hooks/use-function";

export function getConfig(): FriskConfig {
	const schemas: Schema[] = [
		{
			id: "570e9285-3228-4396-b82b-e9752e23cd73",
			name: "Sikkerhetskontrollere",
		},
		{
			id: "816cc808-9188-44a9-8f4b-5642fc2932c4",
			name: "Tjenestenivå og driftskontinuitet",
		},
		{
			id: "248f16c3-9c0e-4177-bf57-aa7d10d2671c",
			name: "IP og DPIA (BETA – UNDER ARBEID)",
		},
		{
			id: "e3ab7a6c-c54e-4240-8314-45990e1d7cf1",
			name: "Datasettvurdering",
		},
	];

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
					const metadata = await getFunctionMetadata(input.functionId);

					if (!metadata) return;

					const metaMap = new Map(
						metadata.map((meta) => [meta.key, meta.value]),
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
				getDisplayValue: async (input) => {
					const backstageType = input.value.match(
						/default\/([^\/]+)\/([^\/]+)/,
					);
					return {
						displayValue: backstageType
							? `${backstageType[1].charAt(0).toUpperCase() + backstageType[1].slice(1)}: ${backstageType[2]}`
							: "Kartverket.dev",
					};
				},
			},
			{
				key: "dependencies",
				type: "select",
				title: "Avhengigheter",
				displayName: "Avhengigheter",
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
					return {
						displayValue: func.name,
						displayOptions: {
							type: "pill",
							displayValue: func.name,
							path: func.path,
						},
					};
				},
				selectMode: "multi",
				show: () => true,
				isRequired: false,
				placeholder: "Søk etter funksjoner",
				inheritFromParent: false,
			},
			{
				key: "card-color",
				type: "color",
				label: "Velg bakgrunnsfargen til kortet",
				show: (mode) => mode === "create" || mode === "update",
				title: undefined,
				getDisplayValue: undefined,
				isRequired: false,
				placeholder: "velg farge",
				inheritFromParent: true,
			},
			...schemas.map(
				(schema): InputMetadata => ({
					key: schema.id,
					title: "Sikkerhetsskjema",
					type: "text",
					textArea: false,
					displayName: schema.name,
					label: "Regelrett skjema",
					show: (mode, hasAccess) => mode === "read" && hasAccess,
					isRequired: false,
					placeholder: "Sett inn skjema",
					inheritFromParent: false,
					onDelete: async (input) => {
						const metadata = await getFunctionMetadata(input.functionId);
						if (!metadata) return;

						const formToDelete = metadata.find((m) => m.key === schema.id);

						if (formToDelete) {
							await deleteForm(formToDelete.value);
						}
					},
					getDisplayValue: async (input) => {
						const contextId = input.value;
						const searchParams = new URLSearchParams({
							redirectBackUrl: window.location.href,
							redirectBackTitle: "Funksjonsregisteret",
						});
						const url = `${getregelrettFrontendUrl()}/context/${contextId}?${searchParams.toString()}`;
						const response = await fetchFromRegelrett(`contexts/${contextId}`);
						if (response.status === 404) {
							return {
								displayValue: schema.name,
								displayOptions: {
									type: "custom",
									component: (
										<SchemaNotFoundDisplay
											schema={schema}
											functionId={input.functionId}
											metadataId={input.id}
										/>
									),
								},
							};
						}
						if (response.status === 403) {
							return {
								displayValue: schema.name,
								displayOptions: {
									type: "custom",
									component: (
										<Tooltip label="Brukeren din har ikke tilgang til denne funksjonen, derfor kan du ikke se eller endre sikkerhetsskjema for den.">
											<Flex width="90%" gap={2} alignItems="center" as="span">
												<Icon icon="article" />
												<Flex alignItems="center">
													<Text fontSize={"sm"}>{schema.name}</Text>
													<Icon size={16} icon="lock" isFilled />
												</Flex>
											</Flex>
										</Tooltip>
									),
								},
							};
						}
						return {
							displayValue: schema.name,
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
			"Funksjonsregisteret (FRISK) lar deg visualisere et hierarki. Her kan man blant annet definere kritikalitet, ansvarlig team og avhengigheter. Du kan også opprette sikkerhetsskjemaer koblet til Regelrett.",
		rootNodeName: "Kartverket",
		columnName: "Funksjon",
		addButtonName: "Legg til funksjon",
		enableEntra: true,
		functionCardComponents: [dependants(), createSchemaComponent(schemas)],
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
		displayValue?: string;
		value?: string;
		displayOptions?:
			| {
					type: "text";
			  }
			| {
					type: "pill";
					path: string;
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
	onDelete?: (input: {
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
		| {
				type: "color";
				placeholder: string;
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
	hasAccess: boolean;
	getMetadataByKeyAndValue: ReturnType<
		typeof useMetadata
	>["metadataByKeyAndValue"];
};

function dependants() {
	return ({ func, getMetadataByKeyAndValue }: FunctionCardComponentProps) => {
		const funcId = func.data?.id.toString() ?? "";
		const meta = getMetadataByKeyAndValue("dependencies", funcId);
		const { functions } = useFunctions(
			meta.data?.map((m) => m.functionId) ?? [],
		);

		if (!meta.data) return;
		if (meta.data.length < 1) return;
		const isLoading = functions.some((f) => f.isLoading);

		if (isLoading) {
			return <Text>Laster...</Text>;
		}

		return (
			<>
				{functions && functions.length > 0 && (
					<>
						<Text fontSize="sm" fontWeight="700">
							Avhengig av meg:
						</Text>
						{functions.map((f) => {
							return (
								<PillView
									key={`dependant-${f.data?.id}`}
									displayValue={f.data?.name}
									funcPath={f.data?.path ?? "1"}
									isLoading={false}
								/>
							);
						})}
					</>
				)}
			</>
		);
	};
}

function createSchemaComponent(schemas: RegelrettSchema[]) {
	return ({
		func,
		metadata,
		addMetadata,
		hasAccess,
	}: FunctionCardComponentProps) => {
		const [selectedSchema, setSelectedSchema] = useState("");
		const availableSchemas = schemas.filter(
			(schema) => !metadata.data?.find((m) => m.key === schema.id),
		);

		if (availableSchemas.length < 1) return;
		if (!hasAccess) return;
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
				<FormControl style={{ width: "fit-content" }}>
					<FormLabel style={{ fontSize: "14px" }}>
						Opprett sikkerhetsskjema
					</FormLabel>
					<Flex alignItems="center" gap={2}>
						<Select
							name="schema"
							onClick={(e) => e.stopPropagation()}
							onChange={(e) => setSelectedSchema(e.target.value)}
							placeholder="Velg sikkerhetsskjema"
							size={"sm"}
							cursor={"pointer"}
						>
							{availableSchemas.map((schema) => (
								<option key={schema.id} value={schema.id}>
									{schema.name}
								</option>
							))}
						</Select>
						<Button
							type="submit"
							variant="primary"
							colorScheme="blue"
							size="sm"
							width="fit-content"
							onClick={(e) => e.stopPropagation()}
							isDisabled={!selectedSchema}
						>
							Opprett
						</Button>
					</Flex>
				</FormControl>
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
				fontSize="xs"
				justifyContent="start"
				flex="1"
			>
				{schema.name}
			</Button>

			<IconButton
				aria-label="Delete schema"
				icon="delete"
				variant="tertiary"
				size="xs"
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

type SchemaNotFoundDisplayProps = Omit<SchemaDisplayProps, "url">;

function SchemaNotFoundDisplay({
	schema,
	functionId,
	metadataId,
}: SchemaNotFoundDisplayProps) {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Flex width="90%" gap={2} alignItems="center">
			<Tooltip label="Vi klarte ikke å finne dette sikkerhetsskjemaet i Regelrett. Vanligvis skyldes det at skjemaet har blitt slettet der. Hvis du vet det stemmer, er det trygt å slette det her også.">
				<Flex gap={2} alignItems="center">
					<Icon
						icon="warning"
						isFilled={true}
						color="var(--kvib-colors-orange-600)"
					/>
					<Icon size={20} icon="article" />
					<Text fontSize="sm">{schema.name}</Text>
				</Flex>
			</Tooltip>
			<IconButton
				aria-label="Delete schema"
				icon="delete"
				variant="tertiary"
				size="xs"
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

const RegelrettSchema = object({
	id: string(),
	name: string(),
});

type RegelrettSchema = z.infer<typeof RegelrettSchema>;

async function getRegelrettTokens() {
	const REGELRETT_CLIENT_ID = getRegelrettClientId();
	const regelrettScope =
		import.meta.env.MODE === "skip"
			? `${REGELRETT_CLIENT_ID}/.default`
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
	try {
		const tokens = await getRegelrettTokens();
		const response = await fetch(`${REGELRETT_BACKEND_URL}/${path}`, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});
		return response;
	} catch (error) {
		console.error("Fetch from Regelrett error:", error);
		throw error;
	}
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

const RegelrettContext = object({
	id: string(),
});

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

async function deleteForm(contextId: string) {
	const response = await fetchFromRegelrett(`/contexts/${contextId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error(`Backend error: ${response.status} ${response.statusText}`);
	}
}
