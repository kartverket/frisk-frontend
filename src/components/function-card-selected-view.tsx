import { useFunction } from "@/hooks/use-function";
import { MetadataView } from "./metadata/metadata-view";
import { useMetadata } from "@/hooks/use-metadata";
import { Route } from "@/routes";
import { Button, Flex, Icon, Skeleton, Stack, Text } from "@kvib/react";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { useState } from "react";

export function FunctionCardSelectedView({
	functionId,
}: { functionId: number }) {
	const { func } = useFunction(functionId);
	const { metadata, addMetadata } = useMetadata(functionId);
	const { config } = Route.useLoaderData();
	const displayedTitles = new Set<string>();
	const [showCopiedTextMessage, setShowCopiedTextMessage] = useState(false);

	return (
		<Stack pl="10px" w="100%" overflow="hidden">
			<Flex alignItems="center" w="100%" flex-wrap="wrap">
				<Skeleton isLoaded={!func.isLoading} flex={1} minWidth={0}>
					<Text
						fontWeight="bold"
						as="span"
						display="flex"
						w="100%"
						overflow="hidden"
					>
						{func.data?.name ?? "<Det skjedde en feil>"}
					</Text>
				</Skeleton>
				<EditAndSelectButtons functionId={functionId} selected />
			</Flex>
			{config.metadata?.map((meta) => {
				const hasMetadata = metadata.data?.some((m) => m.key === meta.key);
				const showTitle = meta.title ? !displayedTitles.has(meta.title) : false;
				if (meta.title && hasMetadata) displayedTitles.add(meta.title);
				return (
					<MetadataView
						key={meta.key}
						metadata={meta}
						functionId={functionId}
						showTitle={showTitle}
					/>
				);
			})}
			{config.functionCardComponents.map((Component) => (
				<Component
					key={Component.toString()}
					func={func}
					metadata={metadata}
					addMetadata={addMetadata}
				/>
			))}
			{!showCopiedTextMessage ? (
				<Button
					aria-label="Copy link"
					padding="0"
					justifyContent="left"
					variant="tertiary"
					leftIcon="content_copy"
					colorScheme="blue"
					fontSize="sm"
					onClick={(e) => {
						e.stopPropagation();
						const permalink = `${window.location.origin}?path=%5B%22${func.data?.id}%22%5D`;
						navigator.clipboard.writeText(permalink);
						setShowCopiedTextMessage(true);
						setTimeout(() => {
							setShowCopiedTextMessage(false);
						}, 3000);
					}}
				>
					Kopier lenke til funksjonskort
				</Button>
			) : (
				<Flex alignItems={"center"} gap={1} paddingTop={2} paddingBottom={2}>
					<Icon
						color="var(--kvib-colors-blue-500)"
						grade={0}
						icon="check"
						size={24}
						weight={300}
					/>
					<Text
						fontSize={"sm"}
						color="var(--kvib-colors-blue-500)"
						align={"center"}
						fontWeight={"600"}
					>
						Kopiert til utklippstavlen
					</Text>
				</Flex>
			)}
		</Stack>
	);
}
