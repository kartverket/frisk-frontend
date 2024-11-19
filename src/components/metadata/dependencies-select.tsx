import {
	Text,
	SearchAsync,
	Icon,
	Input,
	Stack,
	FormControl,
	FormLabel,
} from "@kvib/react";
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
	existingDependencies,
}: {
	existingDependencies?: UseQueryResult<Dependency[]>;
}) {
	const [dependencies, setDependencies] = useState<
		{ label: string; value: number }[]
	>(
		existingDependencies?.data?.map((dependency) => ({
			label: dependency.name,
			value: dependency.id,
		})) ?? [],
	);

	return (
		<FormControl isRequired={false}>
			<FormLabel style={{ fontSize: "small", fontWeight: "medium" }}>
				Velg andre funksjoner denne funksjonen er avhengig av
			</FormLabel>
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
		</FormControl>
	);
}
