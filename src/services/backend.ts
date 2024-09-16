import { array, number, object, string, type z } from "zod";

const BACKEND_URL = import.meta.env.BACKEND_URL ?? "http://localhost:8080";
const BEARER_TOKEN = import.meta.env.BEARER_TOKEN ?? "test123";

// backend fetcher that appends the Bearer token to the request
async function fetchFromBackend(path: string, options: RequestInit) {
	const response = await fetch(`${BACKEND_URL}${path}`, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${BEARER_TOKEN}`,
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

export async function createFunction({
	name,
	description,
	parentId,
}: BackendFunctionCreate) {
	const response = await fetchFromBackend("/functions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, description, parentId }),
	});

	const json = await response.json();
	return BackendFunction.parse(json);
}

export async function deleteFunction(id: number) {
	await fetchFromBackend(`/functions/${id}`, {
		method: "DELETE",
	});
}

export async function createDependency({
	functionId,
	dependencyFunctionId,
}: {
	functionId: number;
	dependencyFunctionId: number;
}) {
	const response = await fetchFromBackend(
		`/functions/${functionId}/dependencies`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ functionId, dependencyFunctionId }),
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
