import { useFunction } from "@/hooks/use-function";
import { MetadataView } from "./metadata/metadata-view";
import { useMetadata } from "@/hooks/use-metadata";
import { Route } from "@/routes";
import { OboFlowFeature } from "../../frisk.config";
import { Stack } from "@kvib/react";

export function FunctionCardExpandableContent({
	functionId,
}: { functionId: number }) {
	const { func } = useFunction(functionId);
	const { metadata, addMetadata } = useMetadata(functionId);
	const { config } = Route.useLoaderData();
	const { flags } = Route.useSearch();

	return (
		<Stack pl="10px">
			{config.metadata?.map((meta) => (
				<MetadataView key={meta.key} metadata={meta} functionId={functionId} />
			))}
			{flags?.includes("oboflow") ? (
				<OboFlowFeature
					func={func}
					metadata={metadata}
					addMetadata={addMetadata}
				/>
			) : (
				config.functionCardComponents.map((Component) => (
					<Component
						key={Component.toString()}
						func={func}
						metadata={metadata}
						addMetadata={addMetadata}
					/>
				))
			)}
		</Stack>
	);
}
