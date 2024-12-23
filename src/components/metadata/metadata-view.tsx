import { useMetadata } from "@/hooks/use-metadata";
import {
	Box,
	Flex,
	IconButton,
	Link,
	Skeleton,
	Text,
	useDisclosure,
} from "@kvib/react";
import { useQueries } from "@tanstack/react-query";
import type { Metadata } from "../../../frisk.config";
import { DeleteMetadataModal } from "../delete-metadata-modal";

type Props = {
	metadata: Metadata;
	functionId: number | undefined;
};

export function MetadataView({ metadata, functionId }: Props) {
	const {
		metadata: { data: currentMetadata, isPending: isCurrentMetadataLoading },
	} = useMetadata(functionId);

	const metadataToDisplay = currentMetadata?.filter(
		(m) => metadata.key === m.key,
	);

	const displayValues = useQueries({
		queries:
			metadataToDisplay?.map((m) => ({
				queryKey: [functionId, metadata.key, m.value, "getDisplayValue"],
				queryFn: async () => {
					return metadata.getDisplayValue?.(m);
				},
			})) ?? [],
	});

	if (displayValues.length === 0 && !isCurrentMetadataLoading) {
		return null;
	}

	return (
		<Box my={1}>
			{metadata.title ? (
				<Text fontSize="xs" fontWeight="700">
					{metadata.title}:
				</Text>
			) : null}
			{displayValues.map((dv, i) => {
				const isDisplayValueLoading = dv.isLoading;
				const displayValue =
					dv.data?.displayValue ?? metadataToDisplay?.[i]?.value;
				const metadataDisplayType = dv.data?.displayOptions?.type;
				const metadataType = metadata.type;
				const metaDataValue = dv.data?.value ?? metadataToDisplay?.[i]?.value;
				const metadataId = metadataToDisplay?.[i]?.id;
				const isLoading = isCurrentMetadataLoading || isDisplayValueLoading;
				const isNoMetadata = !currentMetadata && !isCurrentMetadataLoading;

				if (isNoMetadata) return null;

				switch (metadataDisplayType) {
					case "text":
						return (
							<TextView
								key={metaDataValue}
								displayValue={displayValue}
								isLoading={isLoading}
							/>
						);
					case "url":
						return (
							<LinkView
								key={metaDataValue}
								url={metaDataValue}
								displayValue={displayValue}
								isExternal={dv.data?.displayOptions?.isExternal ?? true}
								isDeletable={
									metadata.showOn === "readOnly" && metadata.isDeletable
								}
								metadataId={metadataId}
								functionId={functionId}
								isLoading={isLoading}
							/>
						);

					case "pill":
						return (
							<PillView
								key={metaDataValue}
								displayValue={displayValue}
								isLoading={isLoading}
							/>
						);

					case undefined:
						switch (metadataType) {
							case "select":
							case "number":
							case "text":
								return (
									<TextView
										key={metaDataValue}
										displayValue={displayValue}
										isLoading={isLoading}
									/>
								);
							case "url":
								return (
									<LinkView
										key={metaDataValue}
										url={metaDataValue}
										displayValue={displayValue}
										isExternal={metadata.isExternal}
										isDeletable={
											metadata.showOn === "readOnly" && metadata.isDeletable
										}
										metadataId={metadataId}
										functionId={functionId}
										isLoading={isLoading}
									/>
								);
							default:
								metadataType satisfies never;
								console.error("Unsupported data type");
								return null;
						}
					default:
						metadataDisplayType satisfies never;
						console.error("Unsupported data type");
						return null;
				}
			})}
		</Box>
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
	isExternal: boolean;
	isDeletable: boolean;
	metadataId: number | undefined;
	functionId: number | undefined;
	isLoading: boolean;
};

function LinkView({
	url,
	displayValue,
	isExternal,
	isDeletable,
	metadataId,
	functionId,
	isLoading,
}: LinkViewProps) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	return (
		<Skeleton isLoaded={!isLoading} fitContent>
			<Flex alignItems="center">
				<Link
					fontSize="sm"
					fontWeight="700"
					colorScheme="blue"
					width="fit-content"
					isExternal={isExternal}
					href={url}
					onClick={(e) => e.stopPropagation()}
				>
					{displayValue ?? "<Ingen lenke>"}
				</Link>
				{isDeletable && (
					<IconButton
						aria-label="delete"
						icon="delete"
						variant="tertiary"
						size="sm"
						color="black"
						onClick={onOpen}
					/>
				)}
				{functionId && metadataId && (
					<DeleteMetadataModal
						onOpen={onOpen}
						onClose={onClose}
						isOpen={isOpen}
						functionId={functionId}
						metadataId={metadataId}
						displayValue={displayValue}
					/>
				)}
			</Flex>
		</Skeleton>
	);
}

type PillViewProps = {
	displayValue: string | undefined;
	isLoading: boolean;
};

function PillView({ displayValue, isLoading }: PillViewProps) {
	return (
		<Skeleton isLoaded={!isLoading} fitContent>
			<Box
				bg="#BAD7F8"
				paddingRight={1}
				paddingLeft={1}
				borderRadius="md"
				w="fit-content"
				my={1}
			>
				<Text fontSize="xs" fontWeight="500">
					{displayValue ?? "<Ingen verdi>"}
				</Text>
			</Box>
		</Skeleton>
	);
}
