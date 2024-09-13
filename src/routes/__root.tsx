import { FooterInline, Header, KvibProvider } from "@kvib/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const queryClient = new QueryClient();

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<KvibProvider>
				<div className="flex flex-col min-h-svh">
					<header>
						<Header />
					</header>
					<Outlet />
					<footer>
						<FooterInline />
					</footer>
				</div>
			</KvibProvider>
		</QueryClientProvider>
	),
});
