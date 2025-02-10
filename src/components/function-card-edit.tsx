import {
	Flex,
	Input,
	Button,
	useDisclosure,
	FormLabel,
	FormControl,
	Stack,
	IconButton,
	Tooltip,
	Box,
} from "@kvib/react";
import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { DeleteFunctionModal } from "@/components/delete-function-modal.tsx";
import { useIsMutating } from "@tanstack/react-query";
import {
	MetadataInput,
	type MultiSelectOption,
} from "./metadata/metadata-input";
import { useMetadata } from "@/hooks/use-metadata";

export function FunctionCardEdit({ functionId }: { functionId: number }) {
	const { config } = Route.useLoaderData();
	const { func, updateFunction } = useFunction(functionId);
	const { metadata, addMetadata, removeMetadata, updateMetadataValue } =
		useMetadata(functionId);
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

		for (const md of config.metadata ?? []) {
			const existingMetadata =
				metadata.data?.filter((m) => m.key === md.key) || [];
			const metaDataKeyExists: boolean =
				existingMetadata && existingMetadata.length > 0;
			const formElement = form.elements.namedItem(md.key) as
				| HTMLInputElement
				| HTMLSelectElement
				| null;
			if (!formElement) continue;
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

				const promises: Promise<unknown>[] = [];
				if (metaDataKeyExists) {
					for (const md of metadataToDelete) {
						promises.push(
							removeMetadata.mutateAsync({
								id: md.id,
								functionId,
							}),
						);
					}
				}
				for (const newMd of metadataToAdd) {
					promises.push(
						addMetadata.mutateAsync({
							functionId,
							key: md.key,
							value: newMd.value,
						}),
					);
				}
				await Promise.all(promises);
			} else {
				if (formElement.value.trim() === "") {
					if (metaDataKeyExists) {
						const existingMd = existingMetadata[0];
						if (existingMd.id) {
							await removeMetadata.mutateAsync({
								id: existingMd.id,
								functionId,
							});
						}
					}
					continue;
				}
				// if metadatakey not exists: addMetadata
				if (!metaDataKeyExists) {
					await addMetadata.mutateAsync({
						functionId,
						key: md.key,
						value: formElement.value,
					});
				} else {
					const existingMd = existingMetadata[0];
					if (existingMd.value !== formElement.value) {
						existingMd.id &&
							(await updateMetadataValue.mutateAsync({
								id: existingMd.id,
								value: formElement.value,
								key: existingMd.key,
								functionId: existingMd.functionId,
							}));
					}
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

		navigate({ search: { ...search, edit: undefined } });
	}

	return (
		<Box maxWidth="100%">
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
					{config.metadata?.map((meta) => (
						<MetadataInput
							key={meta.key}
							metadata={meta}
							parentFunctionId={undefined}
							functionId={functionId}
						/>
					))}
					<Flex gap="10px" justifyContent="space-between" alignItems="center">
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
						<Tooltip label="Slett funksjon" placement="top">
							<IconButton
								aria-label="delete"
								variant="tertiary"
								icon="delete"
								size="md"
								colorScheme="red"
								ml="auto"
								onClick={onOpen}
								isLoading={isMutating > 0}
							/>
						</Tooltip>
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
		</Box>
	);
}
