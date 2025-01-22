export let config: IConfig;

export interface IConfig {
	clientId: string;
	authority: string;
	redirect_uri: string;
	backend_url: string;
	regelrett_frontend_url: string;
	regelrett_client_id: string;
}

const defaultConfig: IConfig = {
	clientId:
		import.meta.env.VITE_CLIENT_ID ?? "3e09bdb6-734c-473e-ab69-1238057dfc5d",
	authority:
		import.meta.env.VITE_AUTHORITY ??
		"https://login.microsoftonline.com/7531b79e-fd42-4826-bff2-131d82c7b557/v2.0",
	redirect_uri:
		import.meta.env.VITE_LOGIN_REDIRECT_URI ?? "http://localhost:5173",
	backend_url:
		import.meta.env.VITE_BACKEND_URL ?? "https://frisk-backend.fly.dev",
	regelrett_frontend_url:
		import.meta.env.VITE_REGLERRETT_FRONTEND_URL ??
		"https://regelrett-frontend-1024826672490.europe-north1.run.app",
	regelrett_client_id:
		import.meta.env.VITE_REGELRETT_CLIENT_ID ??
		"api://e9dc946b-6fef-44ab-82f1-c0ec2e402903/.default",
};

export async function getConfig(): Promise<IConfig> {
	console.log("getting config...");
	try {
		const response = await fetch("/getConfig");
		const contentType = response.headers.get("Content-Type");
		if (contentType?.includes("application/json")) {
			return response.json() as Promise<IConfig>;
		}
		console.log("Response is not JSON, using default config");
		return defaultConfig;
	} catch (error) {
		return defaultConfig;
	}
}

export function setConfig(_config: IConfig | null) {
	console.log("setting config...");
	config = _config || defaultConfig;
}

export function getClientId() {
	return config.clientId;
}

export function getAuthority() {
	return config.authority;
}

export function getRedirectUri() {
	return config.redirect_uri;
}

export function getBackendUrl() {
	return config.backend_url;
}

export function getregelrettFrontendUrl() {
	return config.regelrett_frontend_url;
}

export function getRegelrettClientId() {
	return config.regelrett_client_id;
}
