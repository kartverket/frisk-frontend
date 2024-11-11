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
import { useEffect, useState } from "react";
import { TeamSelect } from "./team-select";
import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Draggable } from "./draggable";
import { UseQueryResult } from "@tanstack/react-query";

type FunctionFolderProps = {
	functionIds: number[];
};

export function FunctionColumn({ functionIds }: FunctionFolderProps) {
	const { path } = Route.useSearch();
	// const { children, addFunction } = useFunction(functionId, {
	// 	includeChildren: true,
	// });

	const { children, addFunction } = useFunction(undefined, functionIds, {
		includeChildren: true,
	});
	const [disabled, setDisabled] = useState<boolean>();

	const selectedFunctionIds = getIdsFromPath(path);
	console.log("her er selected functionids:", selectedFunctionIds);
	const currentLevel = selectedFunctionIds.indexOf(functionIds);

	const [isFormVisible, setFormVisible] = useState(false);

	// const { isOver, setNodeRef } = useDroppable({
	// 	id: selectedFunctionIds[currentLevel],
	// 	disabled: disabled,
	// });

	// useDndMonitor({
	// 	onDragOver(event) {
	// 		const { active, over } = event;
	// 		if (over && active.data.current && active.data.current.func.path) {
	// 			if (over.id === functionId && active.id === over.id) {
	// 				setDisabled(true);
	// 			} else if (
	// 				over.id === functionId &&
	// 				selectedFunctionIds.includes(Number(active.id))
	// 			) {
	// 				setDisabled(
	// 					!getIdsFromPath(active.data.current.func.path).includes(
	// 						Number(over.id),
	// 					),
	// 				);
	// 			}
	// 		}
	// 	},
	// 	onDragEnd() {
	// 		setDisabled(false);
	// 	},
	// });

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
				// ref={setNodeRef}
				// backgroundColor={isOver ? "blue.100" : "white"}
				backgroundColor={"white"}
			>
				<Skeleton isLoaded={!!children} minH={60}>
					<List display="flex" flexDirection="column" gap={2} marginBottom="2">
						{children?.map((childre) =>
							childre.data?.map((child) => (
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
							)),
						)}
					</List>
					{/* {isFormVisible && (
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
										parentId: functionId,
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
								<TeamSelect functionId={functionId} />
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
					)} */}
					<Button
						leftIcon="add"
						variant="tertiary"
						colorScheme="blue"
						onClick={() => setFormVisible(true)}
					>
						Legg til funksjon
					</Button>
				</Skeleton>
			</Box>
		</Flex>
	);
}
