import { useFunction } from "@/hooks/use-function";
import { useTeam } from "@/hooks/use-team";
import { useUser } from "@/hooks/use-user";
import { Text, Skeleton, Select } from "@kvib/react";

export function TeamSelect({
	functionId,
	edit,
}: { functionId: number; edit?: boolean }) {
	const { metadata } = useFunction(functionId);
	const { teams } = useUser();
	const currentTeamValue = metadata.data?.find((m) => m.key === "team")?.value;
	const { team: currentTeam } = useTeam(currentTeamValue);

	return (
		<>
			<Text fontSize="xs" fontWeight="700" mb="4px">
				Ansvarlig team for denne funksjonen?*
			</Text>
			<Skeleton isLoaded={!!teams.data} fitContent>
				<Select
					id="team-value"
					name="team-value"
					mb="30px"
					size="sm"
					borderRadius="5px"
					required
					placeholder={edit ? "Velg team" : undefined}
					defaultValue={edit ? undefined : currentTeam.data?.id}
				>
					{teams.data?.map((team) => (
						<option key={team.id} value={team.id}>
							{team.displayName}
						</option>
					))}
				</Select>
			</Skeleton>
		</>
	);
}
