import { getFunctionMetadata } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export function useMetadata(functionId: number) {
	const metadata = useQuery({
		queryKey: ["functions", functionId, "metadata"],
		queryFn: async () => {
			const functionMetadata = await getFunctionMetadata(functionId);
			return functionMetadata;
		},
	});

	return metadata;
}
