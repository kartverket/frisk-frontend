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
	Select,
	Skeleton,
	Text,
} from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";

type FunctionFolderProps = {
	functionId: number;
};

export function FunctionColumn({ functionId }: FunctionFolderProps) {
	const { path } = Route.useSearch();
	const { children, addFunction, addMetadata } = useFunction(functionId, {
		includeChildren: true,
	});
	const { teams } = useUser();

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.indexOf(functionId);

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
			<Box border="1px" p="20px" borderColor="gray.400" minH="100%">
				<Skeleton isLoaded={!!children.data} minH={60}>
					<List display="flex" flexDirection="column" gap={2} marginBottom="2">
						{children.data?.map((child) => (
							<ListItem
								key={child.id + child.name + child.parentId + child.path}
							>
								<FunctionCard
									functionId={child.id}
									selected={selectedFunctionIds.includes(child.id)}
								/>
							</ListItem>
						))}
					</List>
					{isFormVisible && (
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								const form = e.target as HTMLFormElement;
								const nameElement = form.elements.namedItem(
									"name",
								) as HTMLInputElement | null;
								const teamElement = document.getElementById(
									"team-value",
								) as HTMLInputElement;
								if (!nameElement) return;

								try {
									const { id: newFunctionId } = await addFunction.mutateAsync({
										name: nameElement.value,
										description: null,
										parentId: functionId,
									});
									if (teamElement) {
										await addMetadata.mutate({
											functionId: newFunctionId,
											key: "team",
											value: teamElement.value,
										});
									}
									// clear form
									form.reset();
									setFormVisible(false);
								} catch (error) {
									console.error(error);
								}
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
								<Text fontSize="xs" fontWeight="700" mb="4px">
									Ansvarlig team for denne funksjonen?
								</Text>
								<Skeleton isLoaded={!!teams.data} fitContent>
									<Select
										id="team-value"
										name="team-value"
										placeholder="Velg team"
										mb="30px"
										size="sm"
										borderRadius="5px"
									>
										{teams.data?.map((team) => (
											<option key={team.id} value={team.id}>
												{team.displayName}
											</option>
										))}
									</Select>
								</Skeleton>
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
