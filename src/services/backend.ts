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

export async function getFunctions(
	search?: string,
): Promise<BackendFunction[]> {
	const response = await fetchFromBackend(
		`/functions${search ? `?search=${search}` : ""}`,
		{
			method: "GET",
		},
	);
	return await response.json();
}

export async function getFunction(id: number): Promise<BackendFunction> {
	const response = await fetchFromBackend(`/functions/${id}`, {
		method: "GET",
	});
	return await response.json();
}

export async function getChildren(id: number): Promise<BackendFunction[]> {
	const response = await fetchFromBackend(`/functions/${id}/children`, {
		method: "GET",
	});
	return await response.json();
}

export async function createFunction({
	name,
	description,
	parentId,
}: BackendFunctionCreate): Promise<BackendFunction> {
	const response = await fetchFromBackend("/functions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, description, parentId }),
	});

	return await response.json();
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
}): Promise<FunctionDependency> {
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

	return await response.json();
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

export async function getDependencies(functionId: number): Promise<number[]> {
	const response = await fetchFromBackend(
		`/functions/${functionId}/dependencies`,
		{
			method: "GET",
		},
	);
	return await response.json();
}

export async function getDependents(functionId: number): Promise<number[]> {
	const response = await fetchFromBackend(
		`/functions/${functionId}/dependents`,
		{
			method: "GET",
		},
	);
	return await response.json();
}

export type BackendFunction = {
	id: number;
	name: string;
	description: string | null;
	path: string;
	parentId: number | null;
};

type BackendFunctionCreate = Omit<BackendFunction, "id" | "path">;

export type FunctionDependency = {
	functionId: number;
	dependencyFunctionId: number;
};
