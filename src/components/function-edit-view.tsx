import { useFunction } from "@/hooks/use-function";
import { useUser } from "@/hooks/use-user";
import { getFunctions, getMetadataKeys } from "@/services/backend";
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Icon,
	Input,
	SearchAsync,
	Select,
	Skeleton,
	Textarea,
} from "@kvib/react";
import { useState } from "react";
import { Metadata } from "./metadata/metadata";

type FunctionEditViewProps = {
	functionId: number;
	onEditComplete?: () => void;
};

export function FunctionEditView({
	functionId,
	onEditComplete,
}: FunctionEditViewProps) {
	const {
		func,
		updateFunction,
		dependencies,
		addDependency,
		removeDependency,
		metadata,
		addMetadata,
		removeMetadata,
	} = useFunction(functionId, {
		includeDependencies: true,
		includeMetadata: true,
	});
	const [newDependencies, setDependencies] = useState<
		{ label: string; value: number }[]
	>(
		dependencies.data?.map((dependency) => ({
			label: dependency.name,
			value: dependency.id,
		})) ?? [],
	);

	const [customMetadataKey, setCustomMetadataKey] = useState<string>("");
	const [useCustomMetadataKey, setUseCustomMetadataKey] =
		useState<boolean>(false);

	const { teams } = useUser();

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

				if (
					func.data.name !== newNameElement?.value ||
					(func.data.description ?? "") !== newDescriptionElement?.value
				) {
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
			<FormControl>
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

				<FormLabel>Metadata</FormLabel>
				{metadata.data?.map(({ id, ...metadata }) => (
					<Flex gap={2} alignItems="center" key={id}>
						<Metadata metadata={metadata} />
						<Button
							type="button"
							colorScheme="red"
							onClick={() => {
								removeMetadata.mutate({
									id,
									functionId,
								});
							}}
						>
							<Icon icon="delete" />
						</Button>
					</Flex>
				))}

				<Flex gap={2} alignItems="flex-end">
					<Box>
						<FormLabel htmlFor="metadata-key">Metadata nøkkel</FormLabel>
						{useCustomMetadataKey && customMetadataKey ? (
							<Input
								id="metadata-key"
								value={customMetadataKey}
								onChange={(e) => setCustomMetadataKey(e.target.value)}
								type="text"
								name="metadata-key"
								placeholder="Metadata nøkkel"
							/>
						) : (
							<SearchAsync
								value={{
									label: customMetadataKey,
									value: customMetadataKey,
								}}
								isClearable={false}
								debounceTime={100}
								defaultOptions
								dropdownIndicator={<Icon icon="expand_more" weight={400} />}
								loadOptions={(inputValue, callback) => {
									getMetadataKeys(inputValue).then((metadataKeys) => {
										const metaOpts = metadataKeys.map((metadataKey) => ({
											label: metadataKey,
											value: metadataKey,
										}));
										callback(metaOpts);
									});
								}}
								noOptionsMessage={({ inputValue }) => (
									<Button
										onClick={() => {
											setCustomMetadataKey(inputValue);
											setUseCustomMetadataKey(true);
										}}
									>
										<Icon icon="add" /> Bruk {inputValue}
									</Button>
								)}
								onChange={(newValue) =>
									setCustomMetadataKey(newValue?.value ?? "")
								}
								placeholder="Søk"
							/>
						)}
					</Box>
					<Box>
						<FormLabel htmlFor="metadata-value">Metadata verdi</FormLabel>
						{customMetadataKey === "team" ? (
							<Skeleton isLoaded={!!teams.data} fitContent>
								<Select
									id="metadata-value"
									name="metadata-value"
									placeholder="Velg team"
								>
									{teams.data?.map((team) => (
										<option key={team.id} value={team.id}>
											{team.displayName}
										</option>
									))}
								</Select>
							</Skeleton>
						) : (
							<Input
								id="metadata-value"
								type="text"
								name="metadata-value"
								placeholder="Metadata verdi"
							/>
						)}
					</Box>
					<Button
						type="button"
						colorScheme="blue"
						onClick={() => {
							if (!func.data) return;
							const metadataValueElement = document.getElementById(
								"metadata-value",
							) as HTMLInputElement;
							addMetadata.mutate({
								functionId: func.data.id,
								key: customMetadataKey,
								value: metadataValueElement.value,
							});
							setCustomMetadataKey("");
							metadataValueElement.value = "";
						}}
					>
						Legg til
					</Button>
				</Flex>

				<Button type="submit">Lagre</Button>
			</FormControl>
		</form>
	);
}
