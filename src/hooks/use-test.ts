import { hei } from "@/services/backend";
import { useQuery } from "@tanstack/react-query";

export function test(key: string, value: string, path: string) {
	const test = useQuery({
		queryKey: [key, value, path],
		queryFn: () => hei(key, value, path),
	});
}
