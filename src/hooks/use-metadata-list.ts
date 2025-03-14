import { useQueries, useQueryClient } from "@tanstack/react-query";
import { type FunctionMetadata, getFunctionMetadata } from "@/services/backend.ts";

type UseMetadataListOpts = {
	hasFunctionIds: boolean;
};
export function useMetadataList(
	functionIds: number[],
	opts: UseMetadataListOpts,
) {
	const queryClient = useQueryClient();

	const metadataList = useQueries({
		queries: functionIds.map((id) => ({
			refetchOnMount: false,
			queryKey: ["functions", id, "metadata"],
			queryFn: async () => {
				const functionMetadata = await getFunctionMetadata(id);

				for (const data of functionMetadata) {
					queryClient.setQueryData<FunctionMetadata>(
						["functionsMetadata", data.id],
						data,
					);
				}

				return functionMetadata;
			},
			enabled: opts.hasFunctionIds,
		})),
	});

	return { metadataList };
}
