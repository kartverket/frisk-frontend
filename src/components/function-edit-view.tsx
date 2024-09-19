import { useFunction } from "@/hooks/use-function";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { type BackendFunction, getFunctions } from "@/services/backend";
import {
	Button,
	FormControl,
	FormLabel,
	Icon,
	Input,
	SearchAsync,
	Textarea,
} from "@kvib/react";
import { useCallback, useState } from "react";

type FunctionEditViewProps = {
	functionId: number;
	onEditComplete?: () => void;
};

export function FunctionEditView({
	functionId,
	onEditComplete,
}: FunctionEditViewProps) {
	const { path } = Route.useSearch();
	const {
		func,
		updateFunction,
		removeFunction,
		dependencies,
		addDependency,
		removeDependency,
	} = useFunction(functionId, {
		includeDependencies: true,
	});
	const [newDependencies, setDependencies] = useState<
		{ label: string; value: number }[]
	>(
		dependencies.data?.map((dependency) => ({
			label: dependency.name,
			value: dependency.id,
		})) ?? [],
	);

	const navigate = Route.useNavigate();

	const selectedFunctionIds = getIdsFromPath(path);

	const handleDeletedFunction = useCallback(
		(deletedFunction: BackendFunction) => {
			if (selectedFunctionIds.includes(deletedFunction.id)) {
				const deletedFunctionParentPath = deletedFunction.path
					.split(".")
					.slice(0, -1)
					.join(".");
				navigate({
					search: {
						path: deletedFunctionParentPath ?? "1",
					},
				});
				return;
			}
		},
		[selectedFunctionIds, navigate],
	);

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				if (!func.data) return;
				const newNameElement = e.currentTarget.elements.namedItem(
					"name",
				) as HTMLInputElement | null;
				const newDescriptionElement = e.currentTarget.elements.namedItem(
					"description",
				) as HTMLInputElement | null;

				await updateFunction.mutateAsync({
					...func.data,
					...(newNameElement?.value && newNameElement.value !== func.data.name
						? { name: newNameElement.value }
						: {}),
					...(newDescriptionElement?.value &&
					newDescriptionElement.value !== func.data.description
						? { description: newDescriptionElement.value }
						: {}),
				});

				const dependenciesToCreate = newDependencies.filter(
					(dependency) =>
						!dependencies.data?.map((dep) => dep.id).includes(dependency.value),
				);
				const dependenciesToDelete =
					dependencies.data?.filter(
						(dependency) =>
							!newDependencies.map((dep) => dep.value).includes(dependency.id),
					) ?? [];

				for (const dependency of dependenciesToDelete) {
					removeDependency.mutate({
						functionId,
						dependencyFunctionId: dependency.id,
					});
				}
				for (const dependency of dependenciesToCreate) {
					addDependency.mutate({
						functionId: functionId,
						dependencyFunctionId: dependency.value,
					});
				}
				onEditComplete?.();
			}}
		>
			<FormControl className="flex flex-col gap-2">
				<FormLabel htmlFor="name">Navn</FormLabel>
				<Input
					type="text"
					name="name"
					placeholder="Navn"
					required
					defaultValue={func.data?.name}
				/>

				<FormLabel htmlFor="description">Beskrivelse</FormLabel>
				<Textarea
					name="description"
					placeholder="Beskrivelse"
					defaultValue={func.data?.description ?? ""}
				/>

				<FormLabel htmlFor="async-search">Legg til avhengigheter</FormLabel>
				<SearchAsync
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

				<Button type="submit">Lagre</Button>
				<Button
					colorScheme="red"
					disabled={!func.data}
					onClick={() => {
						if (!func.data) return;
						removeFunction.mutate(func.data.id);
						handleDeletedFunction(func.data);
					}}
				>
					Slett
				</Button>
			</FormControl>
		</form>
	);
}
