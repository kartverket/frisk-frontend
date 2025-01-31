import { useFunction } from "@/hooks/use-function";

import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Stack,
} from "@kvib/react";

import type { MultiSelectOption } from "./metadata/metadata-input";
import { MetadataInput } from "./metadata/metadata-input";
import { Route } from "@/routes";

type CreateFunctionFormProps = {
	functionId: number;
	setSelectedForm: React.Dispatch<React.SetStateAction<number | null>>;
};

export function CreateFunctionForm({
	functionId,
	setSelectedForm,
}: CreateFunctionFormProps) {
	const { config } = Route.useLoaderData();
	const { addFunction } = useFunction(functionId, {});

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const nameElement = form.elements.namedItem(
			"name",
		) as HTMLInputElement | null;

		const metadata = [];

		for (const md of config.metadata ?? []) {
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

		await addFunction.mutateAsync({
			function: {
				name: nameElement.value,
				description: null,
				parentId: functionId,
			},
			metadata: metadata,
		});

		// clear form
		form.reset();
		setSelectedForm(null);
	}

	return (
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
