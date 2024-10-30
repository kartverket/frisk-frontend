import { Link } from "@kvib/react";

export function RegelrettLink({
	metadata: { key, contextId },
}: { metadata: { key: string; contextId: string } }) {
	const url = `${import.meta.env.VITE_REGELRETT_FRONTEND_URL}/context/${contextId}`;
	return (
		<Link href={url} colorScheme="blue" onClick={(e) => e.stopPropagation()}>
			{key
				.split("-")[1]
				.replace(/\+/g, " ")
				.replace(/^\w/, (c) => c.toUpperCase())}
		</Link>
	);
}
