import {
	Box,
	Button,
	Flex,
	Icon,
	IconButton,
	Select,
	Text,
	Tooltip,
	useTheme,
	useToast,
} from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	MouseSensor,
	pointerWithin,
	rectIntersection,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import type { useFunction } from "@/hooks/use-function";
import { getFunctionsCSVDump } from "@/services/backend";
import { Route } from "@/routes";
import {
	MetadataInput,
	type MultiSelectOption,
} from "./metadata/metadata-input";
import { SearchField } from "./search-field";
import { FunctionCard } from "./function-card";
import { useState } from "react";

type FunctionColumnViewProps = {
	path: string[];
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const { config } = Route.useLoaderData();
	const [activeId, setActiveId] = useState<number | null>(null);
	const selectedFunctionIds = getIdsFromPath(path);
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

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
			active.data.current &&
			over?.data.current &&
			active.data.current.func.parentId !== Number(over.data.current.group)
		) {
			const update = active.data.current.update as ReturnType<
				typeof useFunction
			>["updateFunction"];

			const updatedFunc = await update.mutateAsync({
				...active.data.current.func,
				parentId: Number(over.data.current.group),
			});

			if (!selectedFunctionIds.flat().includes(over.data.current.group)) {
				navigate({
					search: {
						...search,
						path: [...path, updatedFunc.path.split(`.${updatedFunc.id}`)[0]],
						filters: search.filters,
						flags: search.flags,
					},
				});
			}
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
				<Flex gap="6">
					<Filters type="filters" />
					<Indicators type="indicators" />
				</Flex>
			</Flex>
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				sensors={sensors}
				collisionDetection={(args) =>
					args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args)
				}
			>
				<Flex>
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

const removeMetadata = (type: "filters" | "indicators", key: string) => {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const updatedFilters = search[type]?.metadata.filter((m) => m.key !== key);
	if (updatedFilters?.length === 0) {
		navigate({
			search: {
				...search,
				[type]: undefined,
			},
		});
	} else {
		updateMetadata(type, updatedFilters);
	}
};

function updateMetadata(
	type: "filters" | "indicators",
	updatedFilters:
		| {
				key: string;
				value?: unknown;
		  }[]
		| undefined,
) {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	navigate({
		search: {
			...search,
			...(search[type]
				? {
						[type]: {
							metadata: updatedFilters ?? [],
						},
					}
				: {}),
		},
	});
}

function addMetadata(type: "filters" | "indicators", key: string) {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	navigate({
		search: {
			...search,
			[type]: {
				metadata: [...(search[type]?.metadata ?? []), { key: key }],
			},
		},
	});
}

function Filters(props: {
	type: "filters" | "indicators";
}) {
	const search = Route.useSearch();
	const selectedFilters = search[props.type]?.metadata;
	const { config } = Route.useLoaderData();

	return (
		<Flex flexDirection="column" gap={1}>
			<Flex alignItems="center" gap="1">
				<Text fontSize="sm" as="b" color="blue.500">
					Filter
				</Text>
			</Flex>
			<Select
				size="sm"
				backgroundColor="white"
				placeholder={`Legg til filter`}
				onChange={(e) => {
					if (e.target.value) {
						addMetadata(props.type, e.target.value);
					}
				}}
			>
				{config.metadata
					?.filter((m) => !selectedFilters?.some((f) => f.key === m.key))
					.map((m) => {
						return (
							<option key={m.key} value={m.key}>
								{m.displayName ?? m.key}
							</option>
						);
					})}
			</Select>

			{selectedFilters?.map((selectedFilter) => {
				const metadataForFilter = config.metadata?.find(
					(m) => m.key === selectedFilter.key,
				);
				if (!metadataForFilter) {
					return null;
				}
				return (
					<Flex
						key={selectedFilter.key + selectedFilter.value}
						gap={1}
						alignItems="center"
					>
						<Select
							size="sm"
							backgroundColor="white"
							value={selectedFilter.key}
							placeholder="Fjern filter"
							onChange={(e) => {
								if (e.target.value) {
									const updatedFilters = search[props.type]?.metadata.map(
										(m) => {
											if (m.key === selectedFilter.key) {
												return { key: e.target.value };
											}
											return m;
										},
									);
									updateMetadata(props.type, updatedFilters);
								} else {
									removeMetadata(props.type, selectedFilter.key);
								}
							}}
						>
							{config.metadata
								?.filter(
									(m) =>
										m.key === selectedFilter.key ||
										!search[props.type]?.metadata?.some((f) => f.key === m.key),
								)
								.map((m) => {
									return (
										<option key={m.key} value={m.key}>
											{m.displayName ?? m.key}
										</option>
									);
								})}
						</Select>
						{metadataForFilter.type === "select" && (
							<MetadataInput
								hideLabel
								value={selectedFilter.value as string | MultiSelectOption[]}
								onChange={(value) => {
									const updatedFilterValue = search[props.type]?.metadata.map(
										(m) => {
											if (m.key === selectedFilter.key) {
												return {
													key: selectedFilter.key,
													value: value !== "" ? value : undefined,
												};
											}
											return m;
										},
									);
									updateMetadata(props.type, updatedFilterValue);
								}}
								metadata={metadataForFilter}
								functionId={undefined}
								parentFunctionId={undefined}
							/>
						)}
						<IconButton
							aria-label="Remove filter"
							onClick={() => {
								removeMetadata(props.type, selectedFilter.key);
							}}
							icon="delete"
							colorScheme="red"
							variant="ghost"
						/>
					</Flex>
				);
			})}
		</Flex>
	);
}

function Indicators(props: {
	type: "indicators";
}) {
	const { config } = Route.useLoaderData();
	const search = Route.useSearch();
	const theme = useTheme();

	const selectedIndicator = search.indicators?.metadata.find((m) => m.key);
	const selectedIndicatorMetadata = config.metadata?.find(
		(m) => m.key === selectedIndicator?.key,
	);

	const metadataOptions = config.metadata?.filter(
		(m) => !(m.type === "select" && m.selectMode === "multi"),
	);

	return (
		<Flex flexDirection="column" gap={1}>
			<Flex alignItems="center" gap="1">
				<Text fontSize="sm" as="b" color="blue.500">
					Indikator
				</Text>
				<Tooltip label="Viser indikatorer om metadata finnes på under-/overfunksjoner">
					<Box as="span" display="inline-flex" alignItems="center">
						<Icon
							aria-label="info"
							icon="info"
							size={21}
							color={theme.colors.blue[500]}
						/>
					</Box>
				</Tooltip>
			</Flex>
			<Flex gap={1} alignItems="center">
				<div style={{ position: "relative" }}>
					<Select
						size="sm"
						backgroundColor="white"
						placeholder="Velg indikator"
						value={
							selectedIndicatorMetadata
								? selectedIndicatorMetadata.key
								: "Velg indikator"
						}
						onChange={(e) => {
							if (e.target.value) {
								if (!selectedIndicatorMetadata) {
									addMetadata(props.type, e.target.value);
								} else {
									updateMetadata(props.type, [{ key: e.target.value }]);
								}
							} else {
								if (selectedIndicatorMetadata)
									removeMetadata(props.type, selectedIndicatorMetadata?.key);
							}
						}}
					>
						{metadataOptions?.map((m) => {
							return (
								<option key={m.key} value={m.key}>
									{m.displayName ?? m.key}
								</option>
							);
						})}
					</Select>
					{selectedIndicator && (
						<IconButton
							position="absolute"
							top="1px"
							right="25px"
							aria-label="Remove indicator"
							variant="tertiary"
							size="sm"
							color="black"
							colorScheme={"red"}
							onClick={(e) => {
								e.stopPropagation();
								removeMetadata(props.type, selectedIndicator.key);
							}}
							icon={"close"}
						/>
					)}
				</div>

				{selectedIndicator && selectedIndicatorMetadata?.type === "select" && (
					<MetadataInput
						hideLabel
						value={selectedIndicator.value as string | MultiSelectOption[]}
						onChange={(value) => {
							const updatedFilterValue = search[props.type]?.metadata.map(
								(m) => {
									if (m.key === selectedIndicator.key) {
										return {
											key: selectedIndicator.key,
											value: value !== "" ? value : undefined,
										};
									}
									return m;
								},
							);
							updateMetadata(props.type, updatedFilterValue);
						}}
						metadata={selectedIndicatorMetadata}
						functionId={undefined}
						parentFunctionId={undefined}
					/>
				)}
			</Flex>
		</Flex>
	);
}
