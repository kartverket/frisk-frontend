import { useFunction } from "@/hooks/use-function";
import { useTeam } from "@/hooks/use-team";
import { useUser } from "@/hooks/use-user";
import { Text, Skeleton, Select, FormLabel, FormControl } from "@kvib/react";

export function TeamSelect({
	functionId,
}: { functionId: number; edit?: boolean }) {
	const { metadata } = useFunction(functionId, { includeMetadata: true });
	const { teams } = useUser();
	const currentTeamValue = metadata.data?.find((m) => m.key === "team")?.value;
	const { team: currentTeam } = useTeam(currentTeamValue);

	return (
		<FormControl isRequired>
			<FormLabel
				style={{
					fontSize: "small",
					fontWeight: "medium",
				}}
			>
				Ansvarlig team for denne funksjonen?
			</FormLabel>
			<Skeleton isLoaded={!teams.isLoading} fitContent>
				{teams.isSuccess ? (
					<Select
						id="team-value"
						name="team-value"
						size="sm"
						borderRadius="5px"
						required
						placeholder={currentTeam.data?.id ? undefined : "Velg team"}
						defaultValue={currentTeam.data?.id}
					>
						{teams.data?.map((team) => (
							<option key={team.id} value={team.id}>
								{team.displayName.replace(/.* - /, "")}
							</option>
						))}
					</Select>
				) : teams.isError ? (
					<Text>Det skjedde en feil</Text>
				) : null}
			</Skeleton>
		</FormControl>
	);
}
