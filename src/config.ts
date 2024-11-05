export let config: IConfig;

export interface IConfig {
	clientId: string;
	authority: string;
	redirect_uri: string;
	backend_url: string;
	regelrett_frontend_url: string;
}

const defaultConfig: IConfig = {
	clientId: "3e09bdb6-734c-473e-ab69-1238057dfc5d",
	authority:
		"https://login.microsoftonline.com/7531b79e-fd42-4826-bff2-131d82c7b557/v2.0",
	redirect_uri: "http://localhost:5173",
	backend_url: "https://frisk-backend.fly.dev",
	regelrett_frontend_url:
		"https://regelrett-frontend-1024826672490.europe-north1.run.app",
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
