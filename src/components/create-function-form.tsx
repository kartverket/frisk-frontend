import { useFunction } from "@/hooks/use-function";

import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Stack,
} from "@kvib/react";

import { DependenciesSelect } from "./metadata/dependencies-select";

import type { MultiSelectOption } from "./metadata/metadata-input";
import { MetadataInput } from "./metadata/metadata-input";
import { config } from "../../frisk.config";

type CreateFunctionFormProps = {
	functionId: number;
	setSelectedForm: React.Dispatch<React.SetStateAction<number | null>>;
};

export function CreateFunctionForm({
	functionId,
	setSelectedForm,
}: CreateFunctionFormProps) {
	const { addFunction, addDependency, dependencies } = useFunction(functionId, {
		includeDependencies: true,
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

		for (const md of config.metadata) {
			if (md.type === "select" && md.selectMode === "multi") {
				const formElement = form.elements.namedItem(
					md.key,
				) as HTMLSelectElement;
				const values = JSON.parse(formElement.value) as MultiSelectOption[];

				for (const value of values) {
					metadata.push({ key: md.key, value: value.value });
				}
			} else {
				const formElement = form.elements.namedItem(md.key) as
					| HTMLInputElement
					| HTMLSelectElement
					| null;

				if (formElement?.value) {
					metadata.push({ key: md.key, value: formElement.value });
				}
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
		setSelectedForm(null);

		// clear form
		form.reset();
	}

	return (
		<form onSubmit={handleSubmit}>
			<Stack
				bgColor={"white"}
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

				{config.metadata.map((meta) => (
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
						onClick={() => setSelectedForm(null)}
					>
						Avbryt
					</Button>
					<Button type="submit" aria-label="check" colorScheme="blue" size="sm">
						Lagre
					</Button>
				</Flex>
			</Stack>
		</form>
	);
}
