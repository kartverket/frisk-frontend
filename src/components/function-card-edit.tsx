import { Flex, Input, Text, Button, useDisclosure } from "@kvib/react";
import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { DeleteFunctionModal } from "@/components/delete-function-modal.tsx";
import { TeamSelect } from "./team-select";
import { useIsMutating } from "@tanstack/react-query";
import { BackstageInput } from "./metadata/backstage-input";
import { DependenciesSelect } from "./metadata/dependencies-select";

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

	const currentTeamId = metadata.data?.find((m) => m.key === "team");
	const currentBackstageId = metadata.data?.find(
		(m) => m.key === "backstage-url",
	);

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

		if (currentTeamId?.id && teamElement.value) {
			await updateMetadataValue.mutateAsync({
				id: currentTeamId.id,
				value: teamElement.value,
			});
		}

		if (backstageUrlElement.value) {
			if (currentBackstageId?.id) {
				await updateMetadataValue.mutateAsync({
					id: currentBackstageId.id,
					value: backstageUrlElement.value,
				});
			} else {
				await addMetadata.mutateAsync({
					functionId,
					key: "backstage-url",
					value: backstageUrlElement.value,
				});
			}
		} else if (currentBackstageId?.id) {
			await removeMetadata.mutateAsync({
				id: currentBackstageId.id,
				functionId,
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
		<Flex
			flexDirection="column"
			paddingLeft="10px"
			p="2"
			bgColor="white"
			maxWidth="100%"
		>
			<form
				onSubmit={async (e) => {
					await handleSubmit(e);
				}}
			>
				<Text fontSize="xs" fontWeight="700" mb="4px">
					Funksjonsnavn*
				</Text>
				<Input
					autoFocus
					type="text"
					required
					name="name"
					defaultValue={func.data?.name}
					size="sm"
					borderRadius="5px"
					marginBottom="32px"
				/>
				<TeamSelect functionId={functionId} />
				<BackstageInput defaultValue={currentBackstageId?.value} />

				<Text fontSize="xs" fontWeight="700">
					Velg andre funksjoner denne funksjonen er avhengig av
				</Text>
				<DependenciesSelect existingDependencies={dependencies} />
				<Flex gap="10px" mt="32px">
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
		</Flex>
	);
}
