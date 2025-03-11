import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Box, Button, Flex, List, ListItem, Skeleton, Text } from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Droppable } from "./droppable";
import { CreateFunctionForm } from "./create-function-form";
import { useFunction } from "@/hooks/use-function";
import { useMetadata } from "@/hooks/use-metadata";
import type { BackendFunction } from "@/services/backend";
import type { MultiSelectOption } from "./metadata/metadata-input";

type FunctionFolderProps = {
	functionIds: number[];
};

export function FunctionColumn({ functionIds }: FunctionFolderProps) {
	const { config } = Route.useLoaderData();
	const { path } = Route.useSearch();

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.findIndex(
		(ids) => ids.join() === functionIds.join(),
	);
	const [columnHeight, setColumnHeight] = useState<number>();

	useEffect(() => {
		function getColumnHeight() {
			const column = document.getElementById(`${currentLevel}-column`);

			if (!column) return 0;
			const children = column.querySelectorAll("[data-child]");

			return Array.from(children).reduce((total, children) => {
				return total + children.getBoundingClientRect().height;
			}, 0);
		}
		setColumnHeight(getColumnHeight());

		const observer = new MutationObserver(() => {
			setColumnHeight(getColumnHeight());
		});

		const root = document.getElementById("root");
		if (!root) return;
		observer.observe(root, {
			attributes: true,
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
		};
	}, [currentLevel]);

	return (
		<Flex flexDirection="column" width="380px">
			<Box
				bgColor="gray.200"
				border="1px"
				height="46px"
				alignContent="center"
				textAlign="center"
				borderColor="gray.400"
				minH="46px"
				id="topBox"
			>
				<Text size="lg" fontWeight="700">
					{config.columnName} nivå {currentLevel + 1}
				</Text>
			</Box>

			<Box
				border="1px"
				borderColor="gray.400"
				backgroundColor={"white"}
				position="relative"
				minH="100%"
				h={`${columnHeight}px`}
				id={`${currentLevel}-column`}
			>
				{functionIds.map((id) => (
					<ChildrenGroup key={id} functionId={id} />
				))}
			</Box>
		</Flex>
	);
}

function ChildrenGroup({
	functionId,
}: {
	functionId: number;
}) {
	const { config } = Route.useLoaderData();
	const { path } = Route.useSearch();
	const selectedFunctionIds = getIdsFromPath(path);

	const { children } = useFunction(functionId, {
		includeChildren: true,
	});
	const [functionPosition, setFunctionPosition] = useState(0);
	const [selectedForm, setSelectedForm] = useState<number | null>(null);

	const [hasAllMetadataInFilter, setHasAllMetadataInFilter] = useState<
		{ functionId: number; hasAllMetadataInFilter: boolean }[]
	>(
		children.data?.map((child) => ({
			functionId: child.id,
			hasAllMetadataInFilter: false,
		})) ?? [],
	);

	const updateFilterResult = useCallback(
		(functionId: number, hasAllMetadataInFilter: boolean) => {
			setHasAllMetadataInFilter((prev) => {
				const existing = prev.find((item) => item.functionId === functionId);
				if (existing?.hasAllMetadataInFilter === hasAllMetadataInFilter) {
					return prev;
				}
				return [
					...prev.filter((item) => item.functionId !== functionId),
					{ functionId, hasAllMetadataInFilter },
				];
			});
		},
		[],
	);

	const sortedChildren = children.data
		?.sort((a, b) => a.orderIndex - b.orderIndex)
		.sort((a, b) => {
			const aHasAllMetadata = hasAllMetadataInFilter.find(
				(item) => item.functionId === a.id,
			)?.hasAllMetadataInFilter;
			const bHasAllMetadata = hasAllMetadataInFilter.find(
				(item) => item.functionId === b.id,
			)?.hasAllMetadataInFilter;

			if (aHasAllMetadata === bHasAllMetadata) return 0;
			if (aHasAllMetadata) return -1;
			return 1;
		});

	useEffect(() => {
		function getPosition() {
			const top = document.getElementById("topBox");
			const parent = document.getElementById(functionId.toString());
			if (!parent || !top) return 0;
			return (
				parent.getBoundingClientRect().top - top.getBoundingClientRect().bottom
			);
		}
		setFunctionPosition(getPosition());

		const observer = new MutationObserver(() => {
			setFunctionPosition(getPosition());
		});

		const root = document.getElementById("root");
		if (!root) return;
		observer.observe(root, {
			attributes: true,
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
		};
	}, [functionId]);

	return (
		<Skeleton key={functionId} isLoaded={!children.isLoading} minH={60}>
			<Box
				data-child
				id={`${functionId}-children`}
				position="absolute"
				padding={"20px 2px 20px 2px"}
				top={`${functionPosition}px`}
				left={0}
				right={0}
			>
				<Droppable groupId={functionId} droppableId={functionId.toString()}>
					{({ isOver, setNodeRef }) => (
						<Box
							padding={"8px"}
							backgroundColor={isOver ? "blue.100" : "gray.200"}
							borderRadius="md"
							border="1px"
							marginBottom={2}
							ref={setNodeRef}
						>
							<List
								display="flex"
								flexDirection="column"
								gap={2}
								marginBottom="2"
							>
								{sortedChildren?.map((child) => (
									<ChildrenGroupItem
										key={child.id + child.name + child.parentId}
										func={child}
										selected={selectedFunctionIds.some((idList) =>
											idList.includes(child.id),
										)}
										updateFilterResult={updateFilterResult}
									/>
								))}
							</List>
							<Button
								leftIcon="add"
								variant="tertiary"
								colorScheme="blue"
								onClick={() => {
									setSelectedForm(functionId);
								}}
							>
								{config.addButtonName}
							</Button>
						</Box>
					)}
				</Droppable>
				{selectedForm === functionId && (
					<CreateFunctionForm
						functionId={functionId}
						setSelectedForm={setSelectedForm}
					/>
				)}
			</Box>
		</Skeleton>
	);
}

function ChildrenGroupItem({
	func,
	selected,
	updateFilterResult,
}: {
	func: BackendFunction;
	selected: boolean;
	updateFilterResult: (
		functionId: number,
		hasAllMetadataInFilter: boolean,
	) => void;
}) {
	const { metadata } = useMetadata(func.id);
	const { filters } = Route.useSearch();

	const hasAllMetadataInFilter = useMemo(() => {
		if (!metadata.data || !filters) return false;

		return filters.metadata.every((filter) =>
			metadata.data.some(
				(m) =>
					m.key === filter.key &&
					(filter.value === undefined ||
						m.value === filter.value ||
						(filter.value &&
							typeof filter.value === "object" &&
							"value" in filter.value &&
							filter.value.value === m.value) ||
						(Array.isArray(filter.value) &&
							filter.value.every((v) =>
								metadata.data.some(
									(m) =>
										m.key === filter.key &&
										m.value === (v as MultiSelectOption).value,
								),
							))),
			),
		);
	}, [metadata.data, filters]);

	useEffect(() => {
		updateFilterResult(func.id, hasAllMetadataInFilter);
	}, [hasAllMetadataInFilter, updateFilterResult, func.id]);

	// Tillater at alle funksjoner kan flyttes på inntil videre
	//const hasAccess = useHasFunctionAccess(func.id);
	//const isDraggable = config.enableEntra ? hasAccess : true;

	return (
		<Skeleton fitContent isLoaded={!filters || !metadata.isLoading}>
			<ListItem>
				<FunctionCard
					functionId={func.id}
					selected={selected}
					lowlighted={!!filters && !hasAllMetadataInFilter}
				/>
			</ListItem>
		</Skeleton>
	);
}
