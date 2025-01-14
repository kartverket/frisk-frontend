import { Button, Flex, IconButton, Select, Text, useToast } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";

import {
	DndContext,
	DragOverlay,
	type DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import type { useFunction } from "@/hooks/use-function";
import { getFunctionsCSVDump } from "@/services/backend";
import { Route } from "@/routes";
import {
	MetadataInput,
	type MultiSelectOption,
} from "./metadata/metadata-input";
import { SearchField } from "./search-field";
import { useState } from "react";
import { FunctionCard } from "./function-card";

type FunctionColumnViewProps = {
	path: string[];
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const { config } = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const [activeId, setActiveId] = useState<number | null>(null);
	const selectedFunctionIds = getIdsFromPath(path);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 5,
			},
		}),
	);

	const toast = useToast();

	function handleDragStart(event: DragStartEvent) {
		setActiveId(Number(event.active.id));
	}

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (
			over &&
			active.data.current &&
			active.data.current.func.parentId !== Number(over.id)
		) {
			const update = active.data.current.update as ReturnType<
				typeof useFunction
			>["updateFunction"];

			await update.mutateAsync({
				...active.data.current.func,
				parentId: Number(over.id),
			});
		}
	}

	const handleExportCSV = async () => {
		try {
			const csvData = await getFunctionsCSVDump();

			if (!csvData) {
				throw new Error("No data received for CSV");
			}

			const blob = new Blob([csvData], {
				type: "text/csv;charset=utf-8;",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "funkreg_data.csv");

			document.body.appendChild(link);
			link.click();

			document.body.removeChild(link);

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading CSV:", error);
			const toastId = "export-csv-error";
			if (!toast.isActive(toastId)) {
				toast({
					id: toastId,
					title: "Å nei!",
					description:
						"Det kan være du ikke har tilgang til denne funksjonaliteten:",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			}
		}
	};

	const removeFilter = (key: string) => {
		const newFilters = search.filters?.metadata.filter((m) => m.key !== key);
		if (newFilters?.length === 0) {
			navigate({
				search: {
					...search,
					filters: undefined,
				},
			});
		} else {
			navigate({
				search: {
					...search,
					...(search.filters
						? {
								filters: {
									metadata: newFilters ?? [],
								},
							}
						: {}),
				},
			});
		}
	};

	return (
		<Flex flexDirection="column" paddingY="38" paddingX="75" marginBottom="76">
			<Text fontSize="2xl" fontWeight="700" marginBottom="3">
				{config.title}
			</Text>
			<Text fontSize="xs" marginBottom="38">
				{config.description}
			</Text>
			<Button
				padding="0"
				variant="tertiary"
				colorScheme="blue"
				onClick={() => handleExportCSV()}
				rightIcon="download"
				alignSelf="flex-start"
			>
				Eksporter funksjonsregisteret
			</Button>

			<Flex flexDirection="column" w="fit-content" gap={1} pb={2}>
				<SearchField />
				<Select
					size="sm"
					borderRadius="5px"
					placeholder="Legg til filter"
					onChange={(e) => {
						if (e.target.value) {
							navigate({
								search: {
									...search,
									filters: {
										metadata: [
											...(search.filters?.metadata ?? []),
											{ key: e.target.value },
										],
									},
								},
							});
						}
					}}
				>
					{config.metadata
						?.filter(
							(m) => !search.filters?.metadata?.some((f) => f.key === m.key),
						)
						.map((m) => {
							return (
								<option key={m.key} value={m.key}>
									{m.displayName ?? m.key}
								</option>
							);
						})}
				</Select>
				{search.filters?.metadata.map((filterMeta) => {
					const metadata = config.metadata?.find(
						(m) => m.key === filterMeta.key,
					);
					if (!metadata) {
						return null;
					}
					return (
						<Flex
							key={filterMeta.key + filterMeta.value}
							gap={1}
							alignItems="center"
						>
							<Select
								size="sm"
								borderRadius="5px"
								value={filterMeta.key}
								placeholder="Fjern filter"
								onChange={(e) => {
									if (e.target.value) {
										navigate({
											search: {
												...search,
												...(search.filters
													? {
															filters: {
																metadata: search.filters?.metadata.map((m) => {
																	if (m.key === filterMeta.key) {
																		return {
																			key: e.target.value,
																		};
																	}
																	return m;
																}),
															},
														}
													: {}),
											},
										});
									} else {
										removeFilter(filterMeta.key);
									}
								}}
							>
								{config.metadata
									?.filter(
										(m) =>
											m.key === filterMeta.key ||
											!search.filters?.metadata?.some((f) => f.key === m.key),
									)
									.map((m) => {
										return (
											<option key={m.key} value={m.key}>
												{m.displayName ?? m.key}
											</option>
										);
									})}
							</Select>
							<MetadataInput
								hideLabel
								value={filterMeta.value as string | MultiSelectOption[]}
								onChange={(value) => {
									navigate({
										search: {
											...search,
											...(search.filters
												? {
														filters: {
															metadata: search.filters?.metadata.map((m) => {
																if (m.key === filterMeta.key) {
																	return {
																		key: filterMeta.key,
																		value: value !== "" ? value : undefined,
																	};
																}
																return m;
															}),
														},
													}
												: {}),
										},
									});
								}}
								metadata={metadata}
								functionId={undefined}
								parentFunctionId={undefined}
							/>
							<IconButton
								aria-label="Remove filter"
								onClick={() => {
									removeFilter(filterMeta.key);
								}}
								icon="delete"
								colorScheme="red"
								variant="ghost"
							/>
						</Flex>
					);
				})}
			</Flex>
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<Flex overflowX="scroll" gap={2}>
					{selectedFunctionIds?.map((ids) => (
						<FunctionColumn key={ids[0]} functionIds={ids} />
					))}
				</Flex>

				<DragOverlay>
					{activeId ? (
						<FunctionCard
							functionId={activeId}
							selected={false}
							lowlighted={false}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</Flex>
	);
}
