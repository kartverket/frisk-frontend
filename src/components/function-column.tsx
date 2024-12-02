import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Box, Button, Flex, List, ListItem, Skeleton, Text } from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useState } from "react";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import { useFunctions } from "@/hooks/use-functions";
import { AddFunctionForm } from "./add-function-form";

type FunctionFolderProps = {
	functionIds: number[];
};

const CHILDREN_FUNCTION_HEIGHT = 155;
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

	const getTotalChildren = () =>
		children.reduce((total, childrenData) => {
			const numberOfChildren = childrenData.data?.length ?? 0;
			const numberOfSelectedChildren =
				childrenData.data?.filter((child) =>
					path.some((p) => p.includes(child.id.toString())),
				).length ?? 0;
			return total + numberOfChildren + numberOfSelectedChildren;
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
					Funksjon nivå {currentLevel + 1}
				</Text>
			</Box>

			<Box
				border="1px"
				borderColor="gray.400"
				backgroundColor={"white"}
				position="relative"
				minH="100%"
				h={`${getTotalChildren() * CHILDREN_FUNCTION_HEIGHT}px`}
			>
				{children?.map((childre, i) => (
					<Box
						key={functionIds[i]}
						position="absolute"
						display={"flex"}
						flexDirection={"column"}
						width={"100%"}
						padding={"20px 2px 20px 2px"}
						top={`${getParentPosition(functions?.[i].data?.id ?? 0)}px`}
					>
						<Skeleton isLoaded={!childre.isLoading} minH={60}>
							<h1>{functions?.[i].data?.name}</h1>
							{childre.isSuccess ? (
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
										<Button
											leftIcon="add"
											variant="tertiary"
											colorScheme="blue"
											onClick={() => {
												setSelectedForm(functionIds[i]);
											}}
										>
											Legg til funksjon
										</Button>
									</List>
								</Droppable>
							) : childre.isError ? (
								<Text key={""}>Det skjedde en feil</Text>
							) : null}
							{selectedForm === functionIds[i] && (
								<AddFunctionForm
									functionId={functionIds[i]}
									setSelectedForm={setSelectedForm}
								/>
							)}
						</Skeleton>
					</Box>
				))}
			</Box>
		</Flex>
	);
}
