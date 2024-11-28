import { getregelrettFrontendUrl } from "@/config";
import { Link } from "@kvib/react";

export function RegelrettLink({
	metadata: { key, contextId },
}: { metadata: { key: string; contextId: string } }) {
	const searchParams = new URLSearchParams({
		redirectBackUrl: window.location.href,
		redirectBackTitle: "Funksjonsregisteret",
	});
	const url = `${getregelrettFrontendUrl()}/context/${contextId}?${searchParams.toString()}`;
	return (
		<Link
			href={url}
			isExternal={false}
			colorScheme="blue"
			onClick={(e) => e.stopPropagation()}
		>
			{key
				.split("-")[1]
				.replace(/\+/g, " ")
				.replace(/^\w/, (c) => c.toUpperCase())}
		</Link>
	);
}
