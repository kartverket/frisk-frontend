import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Box, Button, Flex, List, ListItem, Skeleton, Text } from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useEffect, useState } from "react";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import { CreateFunctionForm } from "./create-function-form";
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
