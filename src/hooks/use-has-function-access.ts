import { useMetadata } from "./use-metadata";
import { useUser } from "./use-user";

export function useHasFunctionAccess(functionId: number) {
	const { teams } = useUser();

	const functionMetadata = useMetadata(functionId);
	const teamMetadata = functionMetadata.metadata.data?.find(
		(metadata) => metadata.key === "team",
	);

	return teams.data?.some((team) => team.id === teamMetadata?.value);
}
