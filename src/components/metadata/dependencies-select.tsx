import { Text, SearchAsync, Icon, Input } from "@kvib/react";
import { useState } from "react";
import { getFunctions } from "@/services/backend";
import type { UseQueryResult } from "@tanstack/react-query";

type Dependency = {
	id: number;
	path: string;
	name: string;
	description: string | null;
	parentId: number | null;
	orderIndex: number;
};

export function DependenciesSelect({
	// functionId,
	// isNewFunction,
	existingDependencies,
}: {
	// functionId?: number;
	// isNewFunction?: boolean;
	existingDependencies?: UseQueryResult<Dependency[]>;
}) {
	// const { existingDependencies } = useFunction(functionId, {
	// 	includeDependencies: true,
	// 	includeMetadata: true,
	// });

	const [dependencies, setDependencies] = useState<
		{ label: string; value: number }[]
	>(
		existingDependencies?.data?.map((dependency) => ({
			label: dependency.name,
			value: dependency.id,
		})) ?? [],
	);

	return (
		<>
			<Text fontSize="xs" fontWeight="700">
				Velg andre funksjoner denne funksjonen er avhengig av
			</Text>
			<SearchAsync
				id="dependencies"
				size="sm"
				value={dependencies}
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
			<Input
				type="hidden"
				name="dependencies"
				value={JSON.stringify(dependencies.map((dep) => dep.value))}
			/>
		</>
	);
}
