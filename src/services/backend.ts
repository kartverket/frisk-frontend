import { array, number, object, string, type z } from "zod";
import { msalInstance, scopes } from "./msal";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";

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
			Authorization: `Bearer ${tokens.idToken}`,
		},
	});
	if (!response.ok) {
		throw new Error(`Backend error: ${response.status} ${response.statusText}`);
	}
	return response;
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

export async function createFunction(newFunction: BackendFunctionCreate) {
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

export async function createDependency(functionDependency: FunctionDependency) {
	const response = await fetchFromBackend(
		`/functions/${functionDependency.functionId}/dependencies`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(functionDependency),
		},
	);

	const json = await response.json();
	return FunctionDependency.parse(json);
}

export async function deleteDependency({
	functionId,
	dependencyFunctionId,
}: FunctionDependency) {
	await fetchFromBackend(
		`/functions/${functionId}/dependencies/${dependencyFunctionId}`,
		{
			method: "DELETE",
		},
	);
}

export async function getDependencies(functionId: number) {
	const response = await fetchFromBackend(
		`/functions/${functionId}/dependencies`,
		{
			method: "GET",
		},
	);
	const json = await response.json();
	return array(number().int()).parse(json);
}

export async function getDependents(functionId: number) {
	const response = await fetchFromBackend(
		`/functions/${functionId}/dependents`,
		{
			method: "GET",
		},
	);
	const json = await response.json();
	return array(number().int()).parse(json);
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

const BackendFunction = object({
	id: number().int(),
	name: string(),
	description: string().nullable(),
	path: string(),
	parentId: number().int().nullable(),
});
export type BackendFunction = z.infer<typeof BackendFunction>;
type BackendFunctionCreate = Omit<BackendFunction, "id" | "path">;

const FunctionDependency = object({
	functionId: number().int(),
	dependencyFunctionId: number().int(),
});
export type FunctionDependency = z.infer<typeof FunctionDependency>;

const FunctionMetadata = object({
	id: number().int(),
	functionId: number().int(),
	key: string(),
	value: string(),
});
export type FunctionMetadata = z.infer<typeof FunctionMetadata>;
type FunctionMetadataCreate = Omit<FunctionMetadata, "id">;

type Path = `/${string}`;
