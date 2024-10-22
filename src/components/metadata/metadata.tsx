import { isURL } from "@/lib/utils";
import { RegelrettMetadata } from "./regelrett-metadata";
import { TeamMetadata } from "./team-metadata";
import { LinkMetadata } from "./link-metadata";
import { Text } from "@kvib/react";

export function Metadata({
	metadata: { key, value },
}: { metadata: { key: string; value: string } }) {
	switch (true) {
		case key === "team":
			return <TeamMetadata teamId={value} />;

		case key.startsWith("rr-"):
			return (
				<RegelrettMetadata
					metadata={{
						key,
						contextId: value,
					}}
				/>
			);

		case isURL(value):
			return <LinkMetadata metadata={{ key, url: value }} />;

		default:
			return (
				<>
					<Text>{key}</Text>
					<Text>{value}</Text>
				</>
			);
	}
}
