import {
	type Configuration,
	PublicClientApplication,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_CLIENT_ID;

if (!clientId) {
	throw new Error("Client ID is not set");
}

// MSAL configuration
const configuration: Configuration = {
	auth: {
		clientId,
	},
};

export const msalInstance = new PublicClientApplication(configuration);
