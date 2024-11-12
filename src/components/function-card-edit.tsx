import {
	Flex,
	Input,
	Text,
	Button,
	useDisclosure,
	FormLabel,
	SearchAsync,
	Icon,
} from "@kvib/react";
import { useRef, useState } from "react";
import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { DeleteFunctionModal } from "@/components/delete-function-modal.tsx";
import { TeamSelect } from "./team-select";
import { getFunctions } from "@/services/backend";
import { useIsMutating } from "@tanstack/react-query";

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
	const nameInputRef = useRef<HTMLInputElement>(null);
	const backstageUrlRef = useRef<HTMLInputElement>(null);
	const [isUrlValid, setIsUrlValid] = useState(true);
	const navigate = Route.useNavigate();
	const search = Route.useSearch();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const isMutating = useIsMutating();

	const currentTeamId = metadata.data?.find((m) => m.key === "team");
	const currentBackstageId = metadata.data?.find(
		(m) => m.key === "backstage-url",
	);

	const [newDependencies, setDependencies] = useState<
		{ label: string; value: number }[]
	>(
		dependencies.data?.map((dependency) => ({
			label: dependency.name,
			value: dependency.id,
		})) ?? [],
	);

	async function save() {
		const newName = nameInputRef.current?.value;
		const newTeam = document.getElementById("team-value") as HTMLInputElement;
		const newBackstageUrl = backstageUrlRef.current?.value;
		let validSave = true;

		if (newName && func.data && newName !== func.data?.name) {
			await updateFunction.mutateAsync({
				...func.data,
				name: newName,
			});
		}

		if (currentTeamId?.id && newTeam) {
			await updateMetadataValue.mutateAsync({
				id: currentTeamId.id,
				value: newTeam.value,
			});
		}

		if (newBackstageUrl) {
			if (URL.canParse(newBackstageUrl)) {
				if (currentBackstageId?.id) {
					await updateMetadataValue.mutateAsync({
						id: currentBackstageId.id,
						value: newBackstageUrl,
					});
				} else {
					await addMetadata.mutateAsync({
						functionId,
						key: "backstage-url",
						value: newBackstageUrl,
					});
				}
			} else if (newBackstageUrl.trim().length === 0) {
				if (currentBackstageId?.id) {
					await removeMetadata.mutateAsync({
						id: currentBackstageId.id,
						functionId,
					});
				}
			} else {
				setIsUrlValid(false);
				validSave = false;
			}
		} else if (currentBackstageId?.id) {
			await removeMetadata.mutateAsync({
				id: currentBackstageId.id,
				functionId,
			});
		}

		const dependenciesToCreate = newDependencies.filter(
			(dependency) =>
				!dependencies.data?.map((dep) => dep.id).includes(dependency.value),
		);
		const dependenciesToDelete =
			dependencies.data?.filter(
				(dependency) =>
					!newDependencies.map((dep) => dep.value).includes(dependency.id),
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
					dependencyFunctionId: dependency.value,
				}),
			);
		}
		await Promise.all(promises);

		if (validSave) {
			navigate({ search: { ...search, edit: undefined } });
		}
	}

	return (
		<Flex flexDirection="column" paddingLeft="10px" p="2" bgColor="white">
			<Text fontSize="xs" fontWeight="700" mb="4px">
				Funksjonsnavn*
			</Text>
			<Input
				autoFocus
				type="text"
				required
				ref={nameInputRef}
				name="name"
				defaultValue={func.data?.name}
				size="sm"
				borderRadius="5px"
				marginBottom="32px"
				onClick={(e) => {
					e.preventDefault();
				}}
			/>
			<TeamSelect functionId={functionId} />
			<Text fontSize="xs" fontWeight="700" mb="4px">
				Lenke til Backstage
			</Text>
			<Flex flexDirection="column">
				<Input
					placeholder="Input"
					type="url"
					variant="outline"
					ref={backstageUrlRef}
					size="sm"
					borderRadius="5px"
					defaultValue={currentBackstageId?.value}
					isInvalid={!isUrlValid}
					onChange={() => setIsUrlValid(true)}
					marginBottom={isUrlValid ? "32px" : "0px"}
				/>

				{!isUrlValid && (
					<Text color="red.500" fontSize="xs" marginBottom="32px">
						Ugyldig URL
					</Text>
				)}
			</Flex>

			<FormLabel htmlFor="async-search">
				<Text fontSize="xs" fontWeight="700">
					Velg andre funksjoner denne funksjonen er avhengig av
				</Text>
			</FormLabel>
			<SearchAsync
				size="sm"
				value={newDependencies}
				isMulti
				debounceTime={100}
				defaultOptions
				dropdownIndicator={<Icon icon="expand_more" weight={400} />}
				loadOptions={(inputValue, callback) => {
					getFunctions(inputValue).then((functions) => {
						const depOpts = functions.map((functionData) => ({
							label: functionData.name,
							value: functionData.id,
						}));
						// @ts-expect-error
						callback(depOpts);
					});
				}}
				onChange={(newValue) => {
					// @ts-expect-error
					setDependencies(newValue ?? []);
				}}
				placeholder="Søk"
			/>
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
					aria-label="check"
					colorScheme="blue"
					size="sm"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();

						save();
					}}
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
