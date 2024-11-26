import { useFunction } from "@/hooks/use-function";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	Box,
	Button,
	Flex,
	FormControl,
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

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Draggable } from "./draggable";

import { DependenciesSelect } from "./metadata/dependencies-select";
import { config } from "../../frisk.config";

import { MetadataInput } from "./metadata/metadata-input";

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

		const dependenciesElement = form.elements.namedItem(
			"dependencies",
		) as HTMLSelectElement;

		const metadata = [];

		for (const md of config.metadata ?? []) {
			const formElement = form.elements.namedItem(md.key) as
				| HTMLInputElement
				| HTMLSelectElement
				| null;

			if (formElement?.value) {
				metadata.push({ key: md.key, value: formElement.value });
			}
		}

		if (!nameElement) return;

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
										autoFocus
									/>
								</FormControl>

								{config.metadata?.map((meta) => (
									<MetadataInput
										key={meta.key}
										metadata={meta}
										parentFunctionId={functionId}
										functionId={undefined}
									/>
								))}
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
