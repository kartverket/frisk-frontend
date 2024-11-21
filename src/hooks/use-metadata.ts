import { getFunctionMetadata } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export function useMetadata(functionId: number | undefined) {
	const metadata = useQuery({
		queryKey: ["functions", functionId, "metadata"],
		queryFn: async () => {
			// biome-ignore lint/style/noNonNullAssertion: We know that functionId is not undefined here since the qury is disabled if it is
			const functionMetadata = await getFunctionMetadata(functionId!);
			return functionMetadata;
		},
		enabled: !!functionId,
	});

	return metadata;
}
