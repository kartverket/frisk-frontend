function getConfig(r) {
	var config = {
		clientId: process.env.VITE_CLIENT_ID,
		authority: process.env.VITE_AUTHORITY,
		redirect_uri: process.env.VITE_LOGIN_REDIRECT_URI,
		backend_url: process.env.VITE_BACKEND_URL,
		regelrett_frontend_url: process.env.VITE_REGELRETT_FRONTEND_URL,
		regelrett_client_id: process.env.REGELRETT_CLIENT_ID,
	};
	r.headersOut["Content-Type"] = "application/json";
	r.return(200, JSON.stringify(config));
}

export default { getConfig };
