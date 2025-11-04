import { useMetadata } from "@/hooks/use-metadata";
import {
	Box,
	Button,
	Flex,
	IconButton,
	Link,
	Skeleton,
	Text,
	Textarea,
	useDisclosure,
} from "@kvib/react";
import { useQueries } from "@tanstack/react-query";
import type { Metadata } from "../../../frisk.config";
import { DeleteMetadataModal } from "../delete-metadata-modal";
import TextareaAutosize from "react-textarea-autosize";
import { Route } from "@/routes";

type Props = {
	metadata: Metadata;
	functionId: number;
};

export function MetadataValue({ metadata, functionId }: Props) {
	const {
		metadata: { data: currentMetadata, isPending: isCurrentMetadataLoading },
		metadataAccess,
	} = useMetadata(functionId);

	// metadata is deletable if it is not required, and only shows in read mode, and you have access
	const isDeletable =
		!metadata.isRequired &&
		metadata.show("read", !metadataAccess) &&
		!metadata.show("update", !metadataAccess) &&
		!metadata.show("create", !metadataAccess);

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
		<Box mb={1}>
			{displayValues.map((dv, i) => {
				const isDisplayValueLoading = dv.isLoading;
				const metaDataValue = dv.data?.value ?? metadataToDisplay?.[i]?.value;
				const metadataId = metadataToDisplay?.[i]?.id;
				const isLoading = isCurrentMetadataLoading || isDisplayValueLoading;
				const isNoMetadata = !currentMetadata && !isCurrentMetadataLoading;

				if (isNoMetadata) return null;

				switch (dv.data?.displayOptions?.type) {
					case "text":
						return (
							<TextView
								key={metaDataValue}
								displayValue={dv.data.displayValue}
								isLoading={isLoading}
								isTextArea={metadata.type === "text" && metadata.textArea}
							/>
						);
					case "url":
						return (
							<LinkView
								key={metaDataValue}
								url={metaDataValue}
								displayValue={dv.data.displayValue}
								isExternal={dv.data.displayOptions.isExternal}
								isDeletable={isDeletable}
								metadataId={metadataId}
								functionId={functionId}
								isLoading={isLoading}
							/>
						);

					case "pill":
						return (
							<PillView
								key={metaDataValue}
								displayValue={dv.data.displayValue}
								funcPath={dv.data.displayOptions.path}
								isLoading={isLoading}
							/>
						);
					case "custom":
						return dv.data.displayOptions.component;

					case undefined:
						switch (metadata.type) {
							case "select":
							case "number":
							case "text":
								return (
									<TextView
										key={metaDataValue}
										displayValue={dv.data?.displayValue ?? metaDataValue}
										isLoading={isLoading}
										isTextArea={metadata.type === "text" && metadata.textArea}
									/>
								);
							case "url":
								return (
									<LinkView
										key={metaDataValue}
										url={metaDataValue}
										displayValue={dv.data?.displayValue ?? metaDataValue}
										isExternal={metadata.isExternal}
										isDeletable={isDeletable}
										metadataId={metadataId}
										functionId={functionId}
										isLoading={isLoading}
									/>
								);
							default:
								metadata satisfies never;
								console.error("Unsupported data type");
								return null;
						}
					default:
						dv.data?.displayOptions satisfies undefined;
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
	isTextArea: boolean;
};

const TextView: React.FC<TextViewProps> = ({
	displayValue,
	isLoading,
	isTextArea,
}) => {
	return (
		<Skeleton isLoaded={!isLoading} fitContent>
			{isTextArea ? (
				<Textarea
					as={TextareaAutosize}
					padding={0}
					variant="unstyled"
					readOnly
					resize={"none"}
					fontSize="sm"
					value={displayValue ?? ""}
					borderRadius="5px"
					_hover={{ cursor: "inherit", overflowY: "auto" }}
					maxHeight={"70px"}
					minHeight={"auto"}
					overflowY={"hidden"}
					sx={{
						"&::-webkit-scrollbar": {
							width: "6px",
						},
						"&::-webkit-scrollbar-thumb": {
							backgroundColor: "gray.400",
							borderRadius: "3px",
						},
						"&::-webkit-scrollbar-track": {
							background: "transparent",
						},
					}}
				/>
			) : (
				<Text fontSize="sm">{displayValue ?? "<Ingen tekst>"}</Text>
			)}
		</Skeleton>
	);
};

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
						onClick={(e) => {
							e.stopPropagation();
							onOpen();
						}}
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
	funcPath: string;
	isLoading: boolean;
};

export function PillView({ displayValue, funcPath, isLoading }: PillViewProps) {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<Skeleton isLoaded={!isLoading} fitContent>
			<Button
				variant="ghost"
				padding={0}
				margin={0}
				minWidth={0}
				height="auto"
				onClick={(e) => {
					e.stopPropagation();
					const filteredPath = search.path.filter(
						(path) => !funcPath.startsWith(path),
					);
					const newPath = filteredPath.includes(funcPath)
						? filteredPath
						: [...filteredPath, funcPath];
					navigate({
						search: {
							...search,
							path: newPath,
							highlighted: Number(funcPath.split(".").slice(-1)[0] ?? "1"),
						},
					});
				}}
			>
				<Box
					bg="#BAD7F8"
					paddingRight={1}
					paddingLeft={1}
					borderRadius="md"
					w="fit-content"
					my={1}
					transition="box-shadow 0.2s"
					_hover={{
						boxShadow: "md",
						cursor: "pointer",
					}}
				>
					<Text fontSize="sm" fontWeight="500">
						{displayValue ?? "<Ingen verdi>"}
					</Text>
				</Box>
			</Button>
		</Skeleton>
	);
}
