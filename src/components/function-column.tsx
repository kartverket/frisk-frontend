import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Box, Button, Flex, List, ListItem, Skeleton, Text } from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useLayoutEffect, useState } from "react";
import { Draggable } from "./draggable";
import { config } from "../../frisk.config";
import { Droppable } from "./droppable";
import { useFunctions } from "@/hooks/use-functions";
import { CreateFunctionForm } from "./create-function-form";
import { useIsFetching } from "@tanstack/react-query";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";

type FunctionFolderProps = {
	functionIds: number[];
};
const FUNCTION_VIEW_OFFSET = 312;

export function FunctionColumn({ functionIds }: FunctionFolderProps) {
	const [functionPositions, setFunctionPositions] = useState<number[]>([]);

	const { path } = Route.useSearch();

	const { children } = useFunctions(functionIds, {
		includeChildren: true,
	});
	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.findIndex(
		(ids) => ids.join() === functionIds.join(),
	);

	const [selectedForm, setSelectedForm] = useState<number | null>(null);

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

			if (!parent) return 0;

			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			return (
				parent.getBoundingClientRect().top - FUNCTION_VIEW_OFFSET + scrollTop
			);
		};

		const newPositions = functionIds.map((func) => getParentPosition(func));

		setFunctionPositions(newPositions);
	}, [functionIds, isFetching]);

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
				h={`${getColumnHeight()}px`}
				id={`${currentLevel}-column`}
			>
				{children?.map((childre, i) => (
					<Skeleton
						key={functionIds[i]}
						isLoaded={!childre.isLoading}
						minH={60}
					>
						{childre.isSuccess ? (
							<Box
								data-child
								id={`${functionIds[i]}-children`}
								position="absolute"
								padding={"20px 2px 20px 2px"}
								top={`${functionPositions[i]}px`}
								left={0}
								right={0}
							>
								<Droppable id={functionIds[i]}>
									<List
										display="flex"
										flexDirection="column"
										gap={2}
										marginBottom="2"
									>
										{childre.data?.map((child) => (
											<FunctionListItem
												key={child.id}
												childId={child.id}
												selectedFunctionIds={selectedFunctionIds}
											/>
										))}
									</List>
									<Button
										leftIcon="add"
										variant="tertiary"
										colorScheme="blue"
										onClick={() => {
											setSelectedForm(functionIds[i]);
										}}
									>
										{config.addButtonName}
									</Button>
								</Droppable>
								{selectedForm === functionIds[i] && (
									<CreateFunctionForm
										functionId={functionIds[i]}
										setSelectedForm={setSelectedForm}
									/>
								)}
							</Box>
						) : childre.isError ? (
							<Text>Det skjedde en feil</Text>
						) : null}
					</Skeleton>
				))}
			</Box>
		</Flex>
	);
}

function FunctionListItem({
	childId,
	selectedFunctionIds,
}: {
	childId: number;
	selectedFunctionIds: number[][];
}) {
	const hasAccess = useHasFunctionAccess(childId);
	const isDraggable = config.enableEntra && hasAccess;

	return (
		<ListItem key={childId}>
			<Draggable functionId={childId} isDraggable={isDraggable}>
				<FunctionCard
					functionId={childId}
					selected={selectedFunctionIds.some((idList) =>
						idList.includes(childId),
					)}
				/>
			</Draggable>
		</ListItem>
	);
}
