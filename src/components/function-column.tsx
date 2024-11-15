import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Box, Button, Flex, List, ListItem, Skeleton, Text } from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useRef, useState } from "react";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import { useFunctions } from "@/hooks/use-functions";
import { AddFunctionForm } from "./add-function-form";
import { set } from "zod";

type FunctionFolderProps = {
	functionIds: number[];
};

export function FunctionColumn({ functionIds }: FunctionFolderProps) {
	const { path } = Route.useSearch();

	const { functions, children } = useFunctions(functionIds, {
		includeChildren: true,
	});

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.findIndex(
		(ids) => ids.join() === functionIds.join(),
	);

	const [isFormVisible, setFormVisible] = useState(false);

	const functionIdRef = useRef<number>();

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
				p="20px"
				borderColor="gray.400"
				minH="100%"
				backgroundColor={"white"}
			>
				{children?.map((childre, i) => (
					<Skeleton key={"hei"} isLoaded={!childre.isLoading} minH={60}>
						{childre.isSuccess ? (
							<List
								display="flex"
								flexDirection="column"
								gap={2}
								marginBottom="2"
							>
								{/* TODO: fikse sånn at du ikke må dobbelt loope */}

								<Box key={"hei"}>
									<Droppable id={functionIds[i]}>
										<h1>{functions?.[i].data?.name}</h1>
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
												setFormVisible(true);
												functionIdRef.current = functionIds[i];
											}}
										>
											Legg til funksjon
										</Button>
									</Droppable>
								</Box>
							</List>
						) : childre.isError ? (
							<Text>Det skjedde en feil</Text>
						) : null}
					</Skeleton>
				))}
				{isFormVisible && functionIdRef.current && (
					<AddFunctionForm
						functionId={functionIdRef.current}
						setFormVisible={setFormVisible}
					/>
				)}
			</Box>
		</Flex>
	);
}
