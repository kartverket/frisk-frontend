import { useFunction } from "@/hooks/use-function";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	List,
	ListItem,
	Skeleton,
	Stack,
	Text,
} from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useState } from "react";
import { TeamSelect } from "./team-select";
import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Draggable } from "./draggable";
import { BackstageInput } from "./metadata/backstage-input";
import { DependenciesSelect } from "./metadata/dependencies-select";

type FunctionFolderProps = {
	functionId: number;
};

export function FunctionColumn({ functionId }: FunctionFolderProps) {
	const { path } = Route.useSearch();
	const { children, addFunction, addDependency, dependencies } = useFunction(
		functionId,
		{
			includeChildren: true,
			includeDependencies: true,
		},
	);
	const [disabled, setDisabled] = useState<boolean>();

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.indexOf(functionId);

	const [isFormVisible, setFormVisible] = useState(false);

	const { isOver, setNodeRef } = useDroppable({
		id: selectedFunctionIds[currentLevel],
		disabled: disabled,
	});

	useDndMonitor({
		onDragOver(event) {
			const { active, over } = event;
			if (over && active.data.current && active.data.current.func.path) {
				if (over.id === functionId && active.id === over.id) {
					setDisabled(true);
				} else if (
					over.id === functionId &&
					selectedFunctionIds.includes(Number(active.id))
				) {
					setDisabled(
						!getIdsFromPath(active.data.current.func.path).includes(
							Number(over.id),
						),
					);
				}
			}
		},
		onDragEnd() {
			setDisabled(false);
		},
	});

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const nameElement = form.elements.namedItem(
			"name",
		) as HTMLInputElement | null;
		const teamElement = form.elements.namedItem(
			"team-value",
		) as HTMLInputElement;
		const backstageUrlElement = form.elements.namedItem(
			"backstage-url",
		) as HTMLInputElement;
		const dependenciesElement = form.elements.namedItem(
			"dependencies",
		) as HTMLSelectElement;

		if (!nameElement || !teamElement) return;
		const metadata = [
			{
				key: "team",
				value: teamElement.value,
			},
		];

		backstageUrlElement?.value &&
			metadata.push({
				key: "backstage-url",
				value: backstageUrlElement.value,
			});

		const newFunction = await addFunction.mutateAsync({
			function: {
				name: nameElement.value,
				description: null,
				parentId: functionId,
			},
			metadata: metadata,
		});

		const dependenciesSelected: number[] = JSON.parse(
			dependenciesElement.value,
		) as number[];

		const dependenciesToCreate = dependenciesSelected.filter(
			(dependency) =>
				!dependencies.data?.map((dep) => dep.id).includes(dependency),
		);

		const promises: Promise<unknown>[] = [];
		for (const dependency of dependenciesToCreate) {
			promises.push(
				addDependency.mutateAsync({
					functionId: newFunction.id,
					dependencyFunctionId: dependency,
				}),
			);
		}
		await Promise.all(promises);

		// clear form
		form.reset();
		setFormVisible(false);
	}

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
				ref={setNodeRef}
				backgroundColor={isOver ? "blue.100" : "white"}
			>
				<Skeleton isLoaded={!children.isLoading} minH={60}>
					{children.isSuccess ? (
						<List
							display="flex"
							flexDirection="column"
							gap={2}
							marginBottom="2"
						>
							{children.data?.map((child) => (
								<ListItem
									key={child.id + child.name + child.parentId + child.path}
								>
									<Draggable functionId={child.id}>
										<FunctionCard
											functionId={child.id}
											selected={selectedFunctionIds.includes(child.id)}
										/>
									</Draggable>
								</ListItem>
							))}
						</List>
					) : children.isError ? (
						<Text>Det skjedde en feil</Text>
					) : null}
					{isFormVisible && (
						<form onSubmit={handleSubmit}>
							<Stack
								border="1px"
								borderRadius="8px"
								borderColor="blue.500"
								pt="14px"
								px="25px"
								pb="30px"
								gap="20px"
							>
								<FormControl isRequired>
									<FormLabel
										style={{
											fontSize: "small",
											fontWeight: "medium",
										}}
									>
										Funksjonsnavn
									</FormLabel>
									<Input
										type="text"
										name="name"
										placeholder="Navn"
										size="sm"
										borderRadius="5px"
										//mb="20px"
										autoFocus
									/>
								</FormControl>

								<TeamSelect functionId={functionId} />
								<BackstageInput />
								<DependenciesSelect />
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
							</Stack>
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
