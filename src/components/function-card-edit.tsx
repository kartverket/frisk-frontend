import {
	Flex,
	Input,
	Button,
	useDisclosure,
	FormLabel,
	FormControl,
	Stack,
} from "@kvib/react";
import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { DeleteFunctionModal } from "@/components/delete-function-modal.tsx";
import { useIsMutating } from "@tanstack/react-query";
import { DependenciesSelect } from "./metadata/dependencies-select";
import { config } from "../../frisk.config";
import {
	MetadataInput,
	type MultiSelectOption,
} from "./metadata/metadata-input";

export function FunctionCardEdit({ functionId }: { functionId: number }) {
	const {
		func,
		updateFunction,
		metadata,
		updateMetadataValue,
		addMetadata,
		removeMetadata,
		dependencies,
		addDependency,
		removeDependency,
	} = useFunction(functionId, {
		includeDependencies: true,
		includeMetadata: true,
	});
	const navigate = Route.useNavigate();
	const search = Route.useSearch();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const isMutating = useIsMutating();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const nameElement = form.elements.namedItem(
			"name",
		) as HTMLInputElement | null;
		if (!nameElement) return;

		const dependenciesElement = form.elements.namedItem(
			"dependencies",
		) as HTMLSelectElement;

		for (const md of config.metadata) {
			const existingMetadata =
				metadata.data?.filter((m) => m.key === md.key) || [];
			const metaDataKeyExists: boolean =
				existingMetadata && existingMetadata.length > 0;
			const formElement = form.elements.namedItem(md.key) as
				| HTMLInputElement
				| HTMLSelectElement
				| null;
			if (!formElement?.value) continue;
			if (md.type === "select" && md.selectMode === "multi") {
				const newMetadata = JSON.parse(
					formElement.value,
				) as MultiSelectOption[];

				const metadataToAdd = newMetadata.filter(
					(newMd) => !existingMetadata.some((m) => m.value === newMd.value),
				);

				const metadataToDelete = existingMetadata.filter(
					(existingMd) =>
						!newMetadata.some((m) => m.value === existingMd.value),
				);

				const deletePromises: Promise<unknown>[] = [];
				if (metaDataKeyExists) {
					for (const md of metadataToDelete) {
						deletePromises.push(
							removeMetadata.mutateAsync({
								id: md.id,
								functionId,
							}),
						);
					}
					await Promise.all(deletePromises);
				}
				const addPromises: Promise<unknown>[] = [];
				for (const newMd of metadataToAdd) {
					addPromises.push(
						addMetadata.mutateAsync({
							functionId,
							key: md.key,
							value: newMd.value,
						}),
					);
				}
				await Promise.all(addPromises);
			} else {
				const existingMd = existingMetadata[0];
				// if metadatakey not exists: addMetadata
				if (!metaDataKeyExists) {
					await addMetadata.mutateAsync({
						functionId,
						key: md.key,
						value: formElement.value,
					});
				}
				// if form key exists in metadata and new value: updatemetadatavalue
				if (metaDataKeyExists) {
					if (existingMd.value !== formElement.value) {
						existingMd.id &&
							(await updateMetadataValue.mutateAsync({
								id: existingMd.id,
								value: formElement.value,
							}));
					}
				}
				// if input field is set to empty: delete
				if (formElement.value.trim() === "" && metaDataKeyExists) {
					existingMd.id &&
						(await removeMetadata.mutateAsync({
							id: existingMd.id,
							functionId,
						}));
				}
			}
		}

		if (
			nameElement.value &&
			func.data &&
			nameElement.value !== func.data?.name
		) {
			await updateFunction.mutateAsync({
				...func.data,
				name: nameElement.value,
			});
		}

		if (dependenciesElement.value) {
			const dependenciesSelected: number[] = JSON.parse(
				dependenciesElement.value,
			) as number[];

			const dependenciesToCreate = dependenciesSelected.filter(
				(dependency) =>
					!dependencies.data?.map((dep) => dep.id).includes(dependency),
			);
			const dependenciesToDelete =
				dependencies.data?.filter(
					(dependency) =>
						!dependenciesSelected.map((dep) => dep).includes(dependency.id),
				) ?? [];

			const promises: Promise<unknown>[] = [];
			for (const dependency of dependenciesToDelete) {
				promises.push(
					removeDependency.mutateAsync({
						functionId,
						dependencyFunctionId: dependency.id,
					}),
				);
			}
			for (const dependency of dependenciesToCreate) {
				promises.push(
					addDependency.mutateAsync({
						functionId: functionId,
						dependencyFunctionId: dependency,
					}),
				);
			}
			await Promise.all(promises);
		}

		navigate({ search: { ...search, edit: undefined } });
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<Stack
					paddingLeft="10px"
					p="2"
					bgColor="white"
					maxWidth="100%"
					gap="20px"
				>
					<FormControl isRequired>
						<FormLabel style={{ fontSize: "small", fontWeight: "medium" }}>
							Funksjonsnavn
						</FormLabel>
						<Input
							autoFocus
							type="text"
							name="name"
							defaultValue={func.data?.name}
							size="sm"
							borderRadius="5px"
						/>
					</FormControl>
					{config.metadata.map((meta) => (
						<MetadataInput
							key={meta.key}
							metadata={meta}
							parentFunctionId={undefined}
							functionId={functionId}
						/>
					))}
					<DependenciesSelect existingDependencies={dependencies} />
					<Flex gap="10px">
						<Button
							aria-label="decline"
							variant="secondary"
							colorScheme="blue"
							size="sm"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();

								navigate({ search: { ...search, edit: undefined } });
							}}
							isLoading={isMutating > 0}
						>
							Avbryt
						</Button>
						<Button
							type="submit"
							aria-label="check"
							colorScheme="blue"
							size="sm"
							isLoading={isMutating > 0}
						>
							Lagre
						</Button>
						<Button
							aria-label="delete"
							variant="tertiary"
							leftIcon="delete"
							size="sm"
							colorScheme="blue"
							ml="auto"
							onClick={onOpen}
							isLoading={isMutating > 0}
						>
							Slett funksjon
						</Button>
					</Flex>
				</Stack>
			</form>
			<DeleteFunctionModal
				onOpen={onOpen}
				onClose={() => {
					navigate({ search: { ...search, edit: undefined } });
					onClose();
				}}
				isOpen={isOpen}
				functionId={functionId}
			/>
		</>
	);
}
