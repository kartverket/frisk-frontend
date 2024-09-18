import { Header } from "@/components/header";
import { FooterInline, KvibProvider } from "@kvib/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { msalInstance } from "@/services/msal";

const queryClient = new QueryClient();

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<MsalProvider instance={msalInstance}>
				<MsalAuthenticationTemplate
					interactionType={InteractionType.Redirect}
					authenticationRequest={{
						scopes: ["user.read"],
					}}
				>
					<KvibProvider>
						<div className="flex flex-col min-h-svh">
							<Header />
							<Outlet />
							<footer>
								<FooterInline />
							</footer>
						</div>
					</KvibProvider>
				</MsalAuthenticationTemplate>
			</MsalProvider>
		</QueryClientProvider>
	),
});
