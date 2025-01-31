import { Route } from "@/routes";
import { useMetadata } from "./use-metadata";
import { useUser } from "./use-user";

export function useHasFunctionAccess(functionId: number) {
	const { config } = Route.useLoaderData();
	const { teams } = useUser();

	const functionMetadata = useMetadata(functionId);
	if (!config.enableEntra) return true;

	const teamMetadata = functionMetadata.metadata.data?.find(
		(metadata) => metadata.key === "team",
	);

	return teams.data?.some((team) => team.id === teamMetadata?.value) ?? false;
}
