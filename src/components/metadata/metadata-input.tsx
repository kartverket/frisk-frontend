import type { config, SelectMetadata } from "@/frisk.config";
import { useMetadata } from "@/hooks/use-metadata";
import { FormControl, FormLabel, Select, Skeleton, Text } from "@kvib/react";
import { useQuery } from "@tanstack/react-query";

type MetadataInputProps = {
	metadata: (typeof config.metadata)[number];
	functionId: number;
};

export function MetadataInput({ metadata, functionId }: MetadataInputProps) {
	const metadataType = metadata.type;
	switch (metadataType) {
		case "select":
			return <SelectInput metadata={metadata} functionId={functionId} />;
		default:
			metadataType satisfies never;
			console.error("Unsupported data type");
			return null;
	}
}

type SelectInputProps = {
	metadata: SelectMetadata;
	functionId: number;
};

function SelectInput({ metadata, functionId }: SelectInputProps) {
	const currentMetadata = useMetadata(functionId);

	const currentMetadataValue = currentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	const options = useQuery({
		queryKey: [metadata],
		queryFn: metadata.getOptions,
	});

	return (
		<FormControl isRequired={metadata.isRequired}>
			<FormLabel
				style={{
					fontSize: "small",
					fontWeight: "medium",
				}}
			>
				Ansvarlig team for denne funksjonen?
			</FormLabel>
			<Skeleton isLoaded={!options.isLoading} fitContent>
				{options.isSuccess ? (
					<Select
						id="team-value"
						name="team-value"
						size="sm"
						borderRadius="5px"
						required
						placeholder={currentMetadataValue ? undefined : "Velg team"}
						defaultValue={currentMetadataValue}
					>
						{options.data?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.name}
							</option>
						))}
					</Select>
				) : options.isError ? (
					<Text>Det skjedde en feil</Text>
				) : null}
			</Skeleton>
		</FormControl>
	);
}
