import { array, boolean, number, object, string, type z } from "zod";
import { msalInstance, scopes } from "./msal";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { getBackendUrl } from "@/config";

const BACKEND_URL = getBackendUrl() ?? "http://localhost:8080";

async function getTokens() {
	const accounts = msalInstance.getAllAccounts();
	const account = accounts[0];
	if (!account) {
		throw new Error("No active account");
	}
	const tokenResponse = await msalInstance
		.acquireTokenSilent({
			scopes: scopes,
			account: account,
		})
		.catch((error) => {
			if (error instanceof InteractionRequiredAuthError) {
				return msalInstance.acquireTokenRedirect({
					scopes: scopes,
					account: account,
				});
			}
		});

	if (!tokenResponse) {
		throw new Error("No tokenResponse");
	}
	return tokenResponse;
}

// backend fetcher that appends the Bearer token to the request
async function fetchFromBackend(path: Path, options: RequestInit) {
	const tokens = await getTokens();
	const response = await fetch(`${BACKEND_URL}${path}`, {
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

export async function getIndicators(args: {
	key: string;
	value?: string;
	functionId: number;
}) {
	const { key, value, functionId } = args;
	const funcs = await fetchFromBackend(
		`/metadata/indicator?key=${key}${value ? `&value=${value}` : ""}&functionId=${functionId}`,
		{
			method: "GET",
		},
	).then((res) => res.json());
	return array(BackendFunction).parse(funcs);
}

export async function getFunctions(search?: string) {
	const response = await fetchFromBackend(
		`/functions${search ? `?search=${search}` : ""}`,
		{
			method: "GET",
		},
	);
	const json = await response.json();
	return array(BackendFunction).parse(json);
}

export async function getFunction(id: number) {
	const response = await fetchFromBackend(`/functions/${id}`, {
		method: "GET",
	});
	const json = await response.json();
	return BackendFunction.parse(json);
}

export async function getChildren(id: number) {
	const response = await fetchFromBackend(`/functions/${id}/children`, {
		method: "GET",
	});
	const json = await response.json();
	return array(BackendFunction).parse(json);
}

export async function getFunctionAccess(id: number) {
	const response = await fetchFromBackend(`/functions/${id}/access`, {
		method: "GET",
	});
	const json = await response.json();
	return Access.parse(json);
}

export async function createFunction(
	newFunction: BackendFunctionWithMetadataCreate,
) {
	const response = await fetchFromBackend("/functions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(newFunction),
	});

	const json = await response.json();
	return BackendFunction.parse(json);
}

export async function putFunction({ id, ...updatedFunction }: BackendFunction) {
	const response = await fetchFromBackend(`/functions/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updatedFunction),
	});

	const json = await response.json();
	return BackendFunction.parse(json);
}

export async function deleteFunction(id: number) {
	await fetchFromBackend(`/functions/${id}`, {
		method: "DELETE",
	});
}

export async function getMetadataKeys(search?: string) {
	const response = await fetchFromBackend(
		`/metadata/keys${search ? `?search=${search}` : ""}`,
		{
			method: "GET",
		},
	);
	const json = await response.json();
	return array(string()).parse(json);
}

export async function getFunctionMetadata(functionId: number) {
	const response = await fetchFromBackend(`/functions/${functionId}/metadata`, {
		method: "GET",
	});
	const json = await response.json();
	return array(FunctionMetadata).parse(json);
}

export async function getMetadata(key: string, value: string) {
	const response = await fetchFromBackend(
		`/metadata?key=${key}&value=${value}`,
		{
			method: "GET",
		},
	);
	const json = await response.json();
	return array(FunctionMetadata).parse(json);
}

export async function getMetadataAccess(id: number) {
	const response = await fetchFromBackend(`/functions/${id}/metadata/access`, {
		method: "GET",
	});
	const json = await response.json();
	return Access.parse(json);
}

export async function createFunctionMetadata(
	functionMetadata: FunctionMetadataCreate,
) {
	await fetchFromBackend(`/functions/${functionMetadata.functionId}/metadata`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			key: functionMetadata.key,
			value: functionMetadata.value,
		}),
	});
}

export async function deleteFunctionMetadata(id: number) {
	await fetchFromBackend(`/metadata/${id}`, {
		method: "DELETE",
	});
}

export async function patchMetadataValue({
	id,
	...metadataValue
}: MetadataValueUpdate) {
	await fetchFromBackend(`/metadata/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(metadataValue),
	});
}

export async function getFunctionsCSVDump() {
	const response = await fetchFromBackend("/dump", {
		method: "GET",
		headers: {
			"Content-Type": "text/csv",
		},
	});
	return await response.text();
}

type MetadataValueUpdate = { id: number; value: string };

export async function getMyMicrosoftTeams() {
	const response = await fetchFromBackend("/microsoft/me/teams", {
		method: "GET",
	});
	const json = await response.json();
	return array(MicrosoftTeam).parse(json);
}

export async function getTeam(id: string) {
	const response = await fetchFromBackend(`/microsoft/teams/${id}`, {
		method: "GET",
	});
	const json = await response.json();
	return MicrosoftTeam.parse(json);
}

const BackendFunction = object({
	id: number().int(),
	name: string(),
	path: string(),
	parentId: number().int().nullable(),
	orderIndex: number().int(),
});
export type BackendFunction = z.infer<typeof BackendFunction>;
type BackendFunctionCreate = Omit<
	BackendFunction,
	"id" | "path" | "orderIndex"
>;
export type BackendFunctionWithMetadataCreate = {
	function: BackendFunctionCreate;
	metadata: Omit<FunctionMetadataCreate, "functionId">[];
};

const FunctionMetadata = object({
	id: number().int(),
	functionId: number().int(),
	key: string(),
	value: string(),
});
export type FunctionMetadata = z.infer<typeof FunctionMetadata>;
type FunctionMetadataCreate = Omit<FunctionMetadata, "id">;

const MicrosoftTeam = object({
	id: string(),
	displayName: string(),
});
export type MicrosoftTeam = z.infer<typeof MicrosoftTeam>;

type Path = `/${string}`;

const Access = boolean();
