import {
	type Configuration,
	PublicClientApplication,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_CLIENT_ID;
const authority = import.meta.env.VITE_AUTHORITY;
const redirectUri = import.meta.env.VITE_LOGIN_REDIRECT_URI;

if (!clientId) {
	throw new Error("Client ID is not set");
}
if (!authority) {
	throw new Error("Authority is not set");
}
if (!redirectUri) {
	throw new Error("Redirect URI is not set");
}

// MSAL configuration
const configuration: Configuration = {
	auth: {
		clientId,
		authority,
		redirectUri, // Points to window.location.origin. You must register this URI on Microsoft Entra admin center/App Registration.
		postLogoutRedirectUri: "/", // Indicates the page to navigate after logout.
		navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
	},
	cache: {
		cacheLocation: "localStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
		storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
	},
};

export const msalInstance = new PublicClientApplication(configuration);
