const BACKEND_URL = import.meta.env.BACKEND_URL ?? "http://localhost:8080";
const BEARER_TOKEN = import.meta.env.BEARER_TOKEN ?? "test123";

// backend fetcher that appends the Bearer token to the request
async function fetchFromBackend(url: string, options: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
  });
  return response;
}

export async function getFunctions() {
  const response = await fetchFromBackend(`${BACKEND_URL}/functions`, {
    method: "GET",
  });
  return await response.json();
}

export async function getFunction(id: number) {
  const response = await fetchFromBackend(`${BACKEND_URL}/functions/${id}`, {
    method: "GET",
  });
  return await response.json();
}

export async function getChildren(id: number) {
  const response = await fetchFromBackend(
    `${BACKEND_URL}/functions/${id}/children`,
    {
      method: "GET",
    }
  );
  return await response.json();
}

export async function createFunction({
  name,
  parentId,
}: {
  name: string;
  parentId: number;
}) {
  await fetchFromBackend(`${BACKEND_URL}/functions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, parentId }),
  });
}

export async function deleteFunction(id: number) {
  await fetchFromBackend(`${BACKEND_URL}/functions/${id}`, {
    method: "DELETE",
  });
}
