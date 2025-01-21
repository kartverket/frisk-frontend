import { getIndicators } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export function useIndicators(args: {
	key: string;
	value?: string;
	functionId: number;
}) {
	const indicators = useQuery({
		queryKey: [args.key, args.value, args.functionId],
		queryFn: () => getIndicators(args),
	});

	return indicators;
}
