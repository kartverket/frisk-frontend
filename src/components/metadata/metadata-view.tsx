import { useMetadata } from "@/hooks/use-metadata";
import { Link, Skeleton, Text } from "@kvib/react";
import { useQuery } from "@tanstack/react-query";
import type { config } from "frisk.config";

type Props = {
	metadata: (typeof config.metadata)[number];
	functionId: number | undefined;
};

export function MetadataView({ metadata, functionId }: Props) {
	const { data: currentMetadata, isPending: isCurrentMetadataLoading } =
		useMetadata(functionId);

	const metadataToDisplay = currentMetadata?.find(
		(m) => metadata.key === m.key,
	);

	const { data: displayValue, isPending: isDisplayValueLoading } = useQuery({
		queryKey: [functionId, metadata.key, "getDisplayValue"],
		queryFn: async (): ReturnType<
			NonNullable<typeof metadata.getDisplayValue>
		> => {
			if (metadata.getDisplayValue)
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				return metadata.getDisplayValue(metadataToDisplay!);
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			return { displayValue: metadataToDisplay!.value };
		},
		enabled: !!metadataToDisplay,
	});

	const metadataType = displayValue?.displayType ?? metadata.type;
	const metaDataValue = displayValue?.value ?? metadataToDisplay?.value;

	if (!metadataToDisplay && !isCurrentMetadataLoading) return null;

	switch (metadataType) {
		case "text":
		case "number":
		case "select":
			return (
				<TextView
					displayValue={displayValue?.displayValue}
					isLoading={isCurrentMetadataLoading && isDisplayValueLoading}
				/>
			);
		case "url":
			return (
				<LinkView
					url={metaDataValue}
					displayValue={displayValue?.displayValue}
					isLoading={isCurrentMetadataLoading && isDisplayValueLoading}
				/>
			);
		default:
			metadataType satisfies never;
			console.error("Unsupported data type");
			return null;
	}
}

type TextViewProps = {
	displayValue: string | undefined;
	isLoading: boolean;
};

function TextView({ displayValue, isLoading }: TextViewProps) {
	return (
		<Skeleton isLoaded={!isLoading} fitContent>
			<Text>{displayValue}</Text>
		</Skeleton>
	);
}

type LinkViewProps = {
	url: string | undefined;
	displayValue: string | undefined;
	isLoading: boolean;
};

function LinkView({ url, displayValue, isLoading }: LinkViewProps) {
	return (
		<Skeleton isLoaded={!isLoading} fitContent>
			<Link
				fontSize="sm"
				fontWeight="700"
				colorScheme="blue"
				width="fit-content"
				isExternal
				href={url}
				onClick={(e) => e.stopPropagation()}
				marginBottom="10px"
			>
				{displayValue}
			</Link>
		</Skeleton>
	);
}
