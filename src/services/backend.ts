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

export async function getFunctions(): Promise<BackendFunction[]> {
  const response = await fetchFromBackend(`/functions`, {
    method: "GET",
  });
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
  parentId,
}: {
  name: string;
  parentId: number;
}) {
  await fetchFromBackend(`/functions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, parentId }),
  });
}

export async function deleteFunction(id: number) {
  await fetchFromBackend(`/functions/${id}`, {
    method: "DELETE",
  });
}

export type BackendFunction = {
  id: number;
  name: string;
  path: string;
  parentId: number | null;
};
