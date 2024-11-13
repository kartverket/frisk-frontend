import { useFunction } from "@/hooks/use-function";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	Box,
	Button,
	Flex,
	Input,
	List,
	ListItem,
	Skeleton,
	Text,
} from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useState } from "react";
import { TeamSelect } from "./team-select";

import { Draggable } from "./draggable";

import { Droppable } from "./droppable";

type FunctionFolderProps = {
	functionIds: number[];
};

export function FunctionColumn({ functionIds }: FunctionFolderProps) {
	const { path } = Route.useSearch();

	const { functions, children, addFunction } = useFunction(
		undefined,
		functionIds,
		{
			includeChildren: true,
		},
	);

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.findIndex(
		(ids) => ids.join() === functionIds.join(),
	);

	const [isFormVisible, setFormVisible] = useState(false);

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
				<Skeleton isLoaded={!!children} minH={60}>
					<List display="flex" flexDirection="column" gap={2} marginBottom="2">
						{/* TODO: fikse sånn at du ikke må dobbelt loope */}

						{children?.map((childre, i) => (
							<Box key={"hei"}>
								<Droppable id={functionIds[i]}>
									<h1>{functions?.[i].data?.name}</h1>
									{childre.data?.map((child) => (
										<ListItem
											key={child.id + child.name + child.parentId + child.path}
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
										onClick={() => setFormVisible(true)}
									>
										Legg til funksjon
									</Button>
								</Droppable>

								{isFormVisible && (
									<form
										onSubmit={async (e) => {
											e.preventDefault();
											const form = e.target as HTMLFormElement;
											const nameElement = form.elements.namedItem(
												"name",
											) as HTMLInputElement | null;
											const teamElement = form.elements.namedItem(
												"team-value",
											) as HTMLInputElement;
											if (!nameElement || !teamElement) return;

											addFunction.mutateAsync({
												function: {
													name: nameElement.value,
													description: null,
													parentId: functionIds[i],
												},
												metadata: [
													{
														key: "team",
														value: teamElement.value,
													},
												],
											});
											// clear form
											form.reset();
											setFormVisible(false);
										}}
									>
										<Flex
											border="1px"
											borderRadius="8px"
											borderColor="blue.500"
											pt="14px"
											px="25px"
											pb="30px"
											flexDirection="column"
										>
											<Text fontSize="xs" fontWeight="700" mb="4px">
												Funksjonsnavn*
											</Text>
											<Input
												type="text"
												name="name"
												placeholder="Navn"
												required
												size="sm"
												borderRadius="5px"
												mb="20px"
												autoFocus
											/>
											<TeamSelect functionId={functionIds[i]} />
											<Flex gap="10px">
												<Button
													aria-label="delete"
													variant="secondary"
													colorScheme="blue"
													size="sm"
													onClick={() => setFormVisible(false)}
												>
													Avbryt
												</Button>
												<Button
													type="submit"
													aria-label="check"
													colorScheme="blue"
													size="sm"
												>
													Lagre
												</Button>
											</Flex>
										</Flex>
									</form>
								)}
							</Box>
						))}
					</List>
				</Skeleton>
			</Box>
		</Flex>
	);
}
