import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	Box,
	Button,
	Flex,
	Grid,
	GridItem,
	List,
	ListItem,
	Skeleton,
	Text,
} from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useState } from "react";
import { Draggable } from "./draggable";
import { Droppable } from "./droppable";
import { useFunctions } from "@/hooks/use-functions";
import { AddFunctionForm } from "./add-function-form";

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

const FUNCTION_HEIGHT = 58;
const SELECTED_FUNCTION_HEIGHT = 136;

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

	const getParentPosition = (parentId: number, childId: string) => {
		// Sjekk foreldre-nivået basert på `functionIds`
		console.log("!!parent", parentId);

		const parent = document.getElementById(parentId.toString());
		const child = document.getElementById(childId);
		if (parent && child) {
			console.log("AVSTAND", parent.getBoundingClientRect().top);
			return parent.getBoundingClientRect().top - 312;
		}
		return 0;
		//const parentIndex = currentLevel - 1;
		// if (parentIndex >= 0) {
		// 	console.log("parent", selectedFunctionIds);
		// 	console.log("parent", selectedFunctionIds[parentIndex].indexOf(parentId));

		// 	return selectedFunctionIds[parentIndex].indexOf(parentId) * 60;
		// 	// Finner posisjon for forelder hvis tilstede
		// 	// return functionIds.indexOf(childId) * 400; // Juster 60 for ønsket høyde
		// }
		// return 0; // Ingen foreldre, start på 0
	};

	return (
		<Flex flexDirection="column" width="380px" height={"100%"}>
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
				minH="800px"
				backgroundColor={"white"}
				height="100%"
				position="relative"
			>
				{/* <Grid> */}
				{children?.map((childre, i) => (
					// <GridItem
					// 	key={"hei"}
					// 	marginTop={
					// 		currentLevel > 0
					// 			? currentLevel * 10
					// 			: // selectedFunctionIds[currentLevel].indexOf(functionIds[i]) *
					// 				// 	10
					// 				0
					// 	}
					// >

					<Box
						key={"hei"}
						// position={"relative"}
						// marginTop={
						// 	currentLevel > 0
						// 		? `${currentLevel * FUNCTION_HEIGHT}px`
						// 		: // selectedFunctionIds[currentLevel].indexOf(functionIds[i]) *
						// 			// 	10
						// 			0
						// }
						id={`${functions?.[i].data?.id}_group`}
						position="absolute"
						display={"flex"}
						flexDirection={"column"}
						width={"100%"}
						padding={"20px 2px 20px 2px"}
						top={`${getParentPosition(functions?.[i].data?.id ?? 0, `${functions?.[i].data?.id}_group`)}px`} // Bruk foreldres posisjon
					>
						<Skeleton key={"hei"} isLoaded={!childre.isLoading} minH={60}>
							<h1>{functions?.[i].data?.name}</h1>
							{childre.isSuccess ? (
								<Droppable key="." id={functionIds[i]}>
									<List
										display="flex"
										flexDirection="column"
										// justifyContent={"space-between"}
										// height={functionIds[i] === 1 ? "100%" : undefined}
										gap={2}
										marginBottom="2"
									>
										{childre.data?.map((child) => (
											<ListItem
												marginBottom={
													getChildrenFromPath(path, child.id).length
												}
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

					// </GridItem>
				))}
				{/* </Grid> */}
			</Box>
		</Flex>
	);
}
