import { getregelrettFrontendUrl } from "@/config";
import { LinkMetadata } from "./link-metadata";

export function RegelrettMetadata({
	metadata: { key, contextId },
}: { metadata: { key: string; contextId: string } }) {
	const url = `${getregelrettFrontendUrl()}/context/${contextId}`;
	return <LinkMetadata metadata={{ key, url }} />;
}
