import { getIndicators } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export function useIndicators(
	args:
		| {
				key: string;
				value?: string;
				functionId: number;
		  }
		| undefined,
) {
	const indicators = useQuery({
		queryKey: ["indicators", args],
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		queryFn: () => getIndicators(args!),
		enabled: !!args,
	});

	return indicators;
}
