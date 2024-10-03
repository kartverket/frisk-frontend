import { getTeam } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export function useTeam(id: string) {
	const team = useQuery({
		queryKey: ["microsoft", "teams", id],
		queryFn: async () => {
			const team = await getTeam(id);
			return team;
		},
		enabled: true,
	});

	return {
		team,
	};
}
