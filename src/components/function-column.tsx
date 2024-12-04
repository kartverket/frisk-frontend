import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Box, Button, Flex, List, ListItem, Skeleton, Text } from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useState } from "react";
import { Draggable } from "./draggable";
import { config } from "../../frisk.config";
import { Droppable } from "./droppable";
import { useFunctions } from "@/hooks/use-functions";
import { CreateFunctionForm } from "./create-function-form";

type FunctionFolderProps = {
	functionIds: number[];
};
const FUNCTION_HEIGHT = 150;
const SELECTED_FUNCTION_HEIGHT = 200;
const FUNCTION_VIEW_OFFSET = 312;

export function FunctionColumn({ functionIds }: FunctionFolderProps) {
	const { path } = Route.useSearch();

	const { functions, children } = useFunctions(functionIds, {
		includeChildren: true,
	});
	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.findIndex(
		(ids) => ids.join() === functionIds.join(),
	);

	const [selectedForm, setSelectedForm] = useState<number | null>(null);

	const getParentPosition = (parentId: number) => {
		const parent = document.getElementById(parentId.toString());

		if (!parent) return 0;

		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		return (
			parent.getBoundingClientRect().top - FUNCTION_VIEW_OFFSET + scrollTop
		);
	};

	const computeColumnHeight = () =>
		children.reduce((total, childrenData) => {
			const numberOfChildren = childrenData.data?.length ?? 0;
			const numberOfSelectedChildren =
				childrenData.data?.filter((child) =>
					path.some((p) => p.includes(child.id.toString())),
				).length ?? 0;
			return (
				total +
				numberOfChildren * FUNCTION_HEIGHT +
				numberOfSelectedChildren * SELECTED_FUNCTION_HEIGHT
			);
		}, 0);

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
				h={`${computeColumnHeight()}px`}
			>
				{children?.map((childre, i) => (
					<Skeleton
						key={functionIds[i]}
						isLoaded={!childre.isLoading}
						minH={60}
					>
						{childre.isSuccess ? (
							<Box
								position="absolute"
								display={"flex"}
								flexDirection={"column"}
								width={"100%"}
								padding={"20px 2px 20px 2px"}
								top={`${getParentPosition(functions?.[i].data?.id ?? 0)}px`}
							>
								<h1>{functions?.[i].data?.name}</h1>
								<Droppable id={functionIds[i]}>
									<List
										display="flex"
										flexDirection="column"
										gap={2}
										marginBottom="2"
									>
										{childre.data?.map((child) => (
											<ListItem
												key={
													child.id + child.name + child.parentId + child.path
												}
											>
												<Draggable functionId={child.id}>
													<FunctionCard
														functionId={child.id}
														selected={selectedFunctionIds.some((idList) =>
															idList.includes(child.id),
														)}
													/>
												</Draggable>
											</ListItem>
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
