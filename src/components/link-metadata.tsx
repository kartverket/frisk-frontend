import { Link as KvibLink, Text } from "@kvib/react";

export function LinkMetadata({ keyKey, url }: { keyKey: string; url: string }) {
	return (
		<>
			<Text>{keyKey}</Text>
			<KvibLink href={url}>{url}</KvibLink>
		</>
	);
}
