import { Link as KvibLink, Text } from "@kvib/react";

export function LinkMetadata({
	metadata: { key, url },
}: { metadata: { key: string; url: string } }) {
	return (
		<>
			<Text>{key}</Text>
			<KvibLink href={url}>{url}</KvibLink>
		</>
	);
}
