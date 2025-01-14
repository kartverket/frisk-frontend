import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Box, Button, Flex, List, ListItem, Skeleton, Text } from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useLayoutEffect, useState } from "react";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import { CreateFunctionForm } from "./create-function-form";
import { useIsFetching } from "@tanstack/react-query";
import { useFunction } from "@/hooks/use-function";
import { useMetadata } from "@/hooks/use-metadata";
import type { BackendFunction } from "@/services/backend";
import type { MultiSelectOption } from "./metadata/metadata-input";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";

type FunctionFolderProps = {
	functionIds: number[];
};

export function FunctionColumn({ functionIds }: FunctionFolderProps) {
	const { config } = Route.useLoaderData();
	const [functionPositions, setFunctionPositions] = useState<number[]>([]);

	const { path } = Route.useSearch();

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.findIndex(
		(ids) => ids.join() === functionIds.join(),
	);

	const isFetching = useIsFetching();

	function getColumnHeight() {
		const column = document.getElementById(`${currentLevel}-column`);

		if (!column) return 0;
		const children = column.querySelectorAll("[data-child]");

		return Array.from(children).reduce((total, children) => {
			return total + children.getBoundingClientRect().height;
		}, 0);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useLayoutEffect(() => {
		const getParentPosition = (parentId: number) => {
			const parent = document.getElementById(parentId.toString());
			const top = document.getElementById("topBox");

			if (!parent || !top) return 0;

			return (
				parent.getBoundingClientRect().top - top.getBoundingClientRect().bottom
			);
		};

		const newPositions = functionIds.map((func) => getParentPosition(func));

		setFunctionPositions(newPositions);
	}, [functionIds, isFetching]);

	return (
		<Flex
			flexDirection="column"
			width="350px"
			minW="350px"
			bgColor="white"
			borderRadius={5}
			padding={2}
		>
			<Box
				bgColor="gray.200"
				alignContent="center"
				textAlign="center"
				id="topBox"
			/>

			<Box
				position="relative"
				h={`${getColumnHeight()}px`}
				id={`${currentLevel}-column`}
			>
				{functionIds.map((id, i) => (
					<ChildrenGroup
						key={id}
						functionId={id}
						functionPosition={functionPositions[i]}
					/>
				))}
			</Box>
		</Flex>
	);
}

function ChildrenGroup({
	functionId,
	functionPosition,
}: { functionId: number; functionPosition: number }) {
	const { config } = Route.useLoaderData();
	const { path } = Route.useSearch();
	const selectedFunctionIds = getIdsFromPath(path);

	const { children } = useFunction(functionId, {
		includeChildren: true,
	});
	const [selectedForm, setSelectedForm] = useState<number | null>(null);

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
				<Droppable id={functionId}>
					<List display="flex" flexDirection="column" gap={2} marginBottom="2">
						{children.data?.map((child) => (
							<ChildrenGroupItem
								key={child.id + child.name + child.parentId}
								func={child}
								selected={selectedFunctionIds.some((idList) =>
									idList.includes(child.id),
								)}
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
}: { func: BackendFunction; selected: boolean }) {
	const { config } = Route.useLoaderData();
	const { metadata } = useMetadata(func.id);
	const { filters } = Route.useSearch();
	const hasAccess = useHasFunctionAccess(func.id);
	const isDraggable = config.enableEntra ? hasAccess : true;

	const hasAllMetadataInFilter = filters?.metadata.every((filter) =>
		metadata.data?.some(
			(m) =>
				m.key === filter.key &&
				(filter.value === undefined ||
					m.value === filter.value ||
					(Array.isArray(filter.value) &&
						filter.value.every((v) =>
							metadata.data?.some(
								(m) =>
									m.key === filter.key &&
									m.value === (v as MultiSelectOption).value,
							),
						))),
		),
	);

	return (
		<Skeleton fitContent isLoaded={!filters || !metadata.isLoading}>
			<ListItem>
				<Draggable functionId={func.id} hasAccess={isDraggable}>
					<FunctionCard
						functionId={func.id}
						selected={selected}
						lowlighted={!!filters && !hasAllMetadataInFilter}
					/>
				</Draggable>
			</ListItem>
		</Skeleton>
	);
}
