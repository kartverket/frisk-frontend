import { LinkMetadata } from "./link-metadata";

export function RegelrettMetadata({
	metadata: { key, contextId },
}: { metadata: { key: string; contextId: string } }) {
	const url = `${import.meta.env.VITE_REGELRETT_FRONTEND_URL}/context/${contextId}`;
	return <LinkMetadata metadata={{ key, url }} />;
}
