import { Flex, KvibProvider } from "@kvib/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { authenticationRequest, msalInstance } from "@/services/msal";

const queryClient = new QueryClient();

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<MsalProvider instance={msalInstance}>
				<MsalAuthenticationTemplate
					interactionType={InteractionType.Redirect}
					authenticationRequest={authenticationRequest}
				>
					<KvibProvider>
						<Flex flexDirection="column" minHeight="100svh" bgColor="gray.50">
							<Outlet />
						</Flex>
					</KvibProvider>
				</MsalAuthenticationTemplate>
			</MsalProvider>
		</QueryClientProvider>
	),
});
