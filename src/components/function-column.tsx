import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	Box,
	Button,
	Flex,
	GridItem,
	List,
	ListItem,
	Skeleton,
	Text,
} from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useRef, useState } from "react";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import { useFunctions } from "@/hooks/use-functions";
import { AddFunctionForm } from "./add-function-form";
import { number, set } from "zod";

type FunctionFolderProps = {
	functionIds: number[];
};

function getChildrenFromPath(pathArray: string[], x: number): string[] {
	console.log("JAAA", pathArray);
	console.log("JAAA", x);

	const ja = pathArray.filter((path) => {
		const etterX = path.split(`${x}.`);
		return etterX.length > 1 && etterX[1].split(".")[0];
	});

	console.log("JAAA", ja);
	return ja;
}

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
								spacing="100"
								marginBottom="3"
							>
								{/* TODO: fikse sånn at du ikke må dobbelt loope */}

								<Droppable id={functionIds[i]}>
									<h1>{functions?.[i].data?.name}</h1>
									{childre.data?.map((child) => (
										<ListItem
											key={child.id + child.name + child.parentId + child.path}
											marginBottom={getChildrenFromPath(path, child.id).length}
										>
											{/* <GridItem
												bg="red.400"
												id="Grid_ITEM"
												h="100%"
												w="100%"
												rowSpan={getChildrenFromPath(path, child.id).length}
											> */}
											<Draggable functionId={child.id}>
												<FunctionCard
													functionId={child.id}
													selected={selectedFunctionIds.some((idList) =>
														idList.includes(child.id),
													)}
												/>
											</Draggable>
											{/* </GridItem> */}
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
								</Droppable>
							</List>
						) : childre.isError ? (
							<Text>Det skjedde en feil</Text>
						) : null}
						{selectedForm === functionIds[i] && (
							<AddFunctionForm
								functionId={functionIds[i]}
								setSelectedForm={setSelectedForm}
							/>
						)}
					</Skeleton>
				))}
			</Box>
		</Flex>
	);
}
