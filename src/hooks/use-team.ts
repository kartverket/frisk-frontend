import { getTeam } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export function useTeam(id: string | undefined) {
	const team = useQuery({
		queryKey: ["microsoft", "teams", id],
		queryFn: async () => {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const team = await getTeam(id!);
			return team;
		},
		enabled: !!id,
	});

	return {
		team,
	};
}
