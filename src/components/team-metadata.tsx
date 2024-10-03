import { useTeam } from "@/hooks/use-team";
import { Skeleton, Text } from "@kvib/react";

export function TeamMetadata({ teamId }: { teamId: string }) {
	const { team } = useTeam(teamId);

	return (
		<>
			<Text>team</Text>
			<Skeleton isLoaded={!!team.data} minW={70} fitContent>
				<Text>{team.data?.displayName}</Text>
			</Skeleton>
		</>
	);
}
