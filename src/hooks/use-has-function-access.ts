import { Route } from "@/routes";
import { useMetadata } from "./use-metadata";
import { useQuery } from "@tanstack/react-query";

export function useHasFunctionAccess(functionId: number) {
	const { config } = Route.useLoaderData();
	const functionMetadata = useMetadata(functionId);
	const authMetadata = config.metadata?.find((metadata) => metadata.auth);
	const authMetadataValue = functionMetadata.metadata.data?.find(
		(metadata) => metadata.key === authMetadata?.key,
	)?.value;

	const auth = useQuery({
		queryKey: ["auth", authMetadata?.key, authMetadataValue],
		queryFn: async () => {
			if (!config.auth) return true;
			if (!authMetadata) return true;
			if (!authMetadataValue) return false;

			const auth = await config.auth(authMetadataValue);
			return auth;
		},
	});

	return auth.data ?? false;
}
