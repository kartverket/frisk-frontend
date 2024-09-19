import { Header } from "@/components/header";
import { Flex, FooterInline, KvibProvider } from "@kvib/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const queryClient = new QueryClient();

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<KvibProvider>
				<Flex flexDirection="column" minHeight="100svh">
					<Header />
					<Outlet />
					<footer>
						<FooterInline />
					</footer>
				</Flex>
			</KvibProvider>
		</QueryClientProvider>
	),
});
