import { getMyMicrosoftTeams, type MicrosoftTeam } from "@/services/backend";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUser() {
	const queryClient = useQueryClient();
	const { data: teams } = useQuery({
		queryKey: ["microsoft", "me", "teams"],
		queryFn: async () => {
			const teams = await getMyMicrosoftTeams();
			for (const team of teams) {
				queryClient.setQueryData<MicrosoftTeam>(
					["microsoft", "teams", team.id],
					team,
				);
			}
			return teams;
		},
		enabled: true,
	});
	return {
		teams,
	};
}
