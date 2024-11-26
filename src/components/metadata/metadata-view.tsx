import { useMetadata } from "@/hooks/use-metadata";
import { Link, Skeleton, Text } from "@kvib/react";
import { useQueries } from "@tanstack/react-query";
import type { Metadata } from "../../../frisk.config";

type Props = {
	metadata: Metadata;
	functionId: number | undefined;
};

export function MetadataView({ metadata, functionId }: Props) {
	const { data: currentMetadata, isPending: isCurrentMetadataLoading } =
		useMetadata(functionId);

	const metadataToDisplay = currentMetadata?.filter(
		(m) => metadata.key === m.key,
	);

	const displayValues = useQueries({
		queries:
			metadataToDisplay?.map((m) => ({
				queryKey: [functionId, metadata.key, m.value, "getDisplayValue"],
				queryFn: async () => {
					return (
						metadata.getDisplayValue?.(m) ?? {
							displayValue: m.value,
							value: m.value,
							displayType: metadata.type,
						}
					);
				},
			})) ?? [],
	});

	if (displayValues.length === 0 && !isCurrentMetadataLoading) {
		return null;
	}

	return (
		<>
			{displayValues.map((dv, i) => {
				const isDisplayValueLoading = dv.isLoading;
				const displayValue = dv.data?.displayValue;
				const metadataType = dv.data?.displayType ?? metadata.type;
				const metaDataValue = dv.data?.value ?? metadataToDisplay?.[i]?.value;
				const isLoading = isCurrentMetadataLoading || isDisplayValueLoading;
				const isNoMetadata = !currentMetadata && !isCurrentMetadataLoading;

				if (isNoMetadata) return null;

				switch (metadataType) {
					case "text":
					case "number":
					case "select":
						return (
							<TextView displayValue={displayValue} isLoading={isLoading} />
						);
					case "url":
						return (
							<LinkView
								url={metaDataValue}
								displayValue={displayValue}
								isLoading={isLoading}
							/>
						);
					default:
						metadataType satisfies never;
						console.error("Unsupported data type");
						return null;
				}
			})}
		</>
	);
}

type TextViewProps = {
	displayValue: string | undefined;
	isLoading: boolean;
};

function TextView({ displayValue, isLoading }: TextViewProps) {
	return (
		<Skeleton isLoaded={!isLoading} fitContent>
			<Text>{displayValue ?? "<Ingen tekst>"}</Text>
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
				{displayValue ?? "<Ingen lenke>"}
			</Link>
		</Skeleton>
	);
}
