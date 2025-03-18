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
	DragOverlay,
	type DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	pointerWithin,
	rectIntersection,
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
					<Filters type="indicators" />
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

function Filters(props: {
	type: "filters" | "indicators";
}) {
	const { config } = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const theme = useTheme();
	const removeFilter = (key: string) => {
		const newFilters = search[props.type]?.metadata.filter(
			(m) => m.key !== key,
		);
		if (newFilters?.length === 0) {
			navigate({
				search: {
					...search,
					[props.type]: undefined,
				},
			});
		} else {
			navigate({
				search: {
					...search,
					...(search[props.type]
						? {
								[props.type]: {
									metadata: newFilters ?? [],
								},
							}
						: {}),
				},
			});
		}
	};

	return (
		<Flex flexDirection="column" gap={1}>
			<Flex alignItems="center" gap="1">
				<Text fontSize="sm" as="b" color="blue.500">
					{props.type === "filters" ? "Filter" : "Indikator"}
				</Text>
				{props.type === "indicators" && (
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
				)}
			</Flex>
			<Select
				size="sm"
				backgroundColor="white"
				placeholder={`Legg til ${props.type === "filters" ? "filter" : "indikator"}`}
				onChange={(e) => {
					if (e.target.value) {
						navigate({
							search: {
								...search,
								[props.type]: {
									metadata: [
										...(search[props.type]?.metadata ?? []),
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
						(m) => !search[props.type]?.metadata?.some((f) => f.key === m.key),
					)
					/* Vi tar ennå ikke hensyn til arrays i indicators */
					.filter(
						(m) =>
							!(
								props.type === "indicators" &&
								m.type === "select" &&
								m.selectMode === "multi"
							),
					)
					.map((m) => {
						return (
							<option key={m.key} value={m.key}>
								{m.displayName ?? m.key}
							</option>
						);
					})}
			</Select>

			{search[props.type]?.metadata.map((filterMeta) => {
				const metadata = config.metadata?.find((m) => m.key === filterMeta.key);
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
							backgroundColor="white"
							value={filterMeta.key}
							placeholder="Fjern filter"
							onChange={(e) => {
								if (e.target.value) {
									navigate({
										search: {
											...search,
											...(search[props.type]
												? {
														[props.type]: {
															metadata: search[props.type]?.metadata.map(
																(m) => {
																	if (m.key === filterMeta.key) {
																		return {
																			key: e.target.value,
																		};
																	}
																	return m;
																},
															),
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
						{metadata.type === "select" && (
							<MetadataInput
								hideLabel
								value={filterMeta.value as string | MultiSelectOption[]}
								onChange={(value) => {
									navigate({
										search: {
											...search,
											...(search[props.type]
												? {
														[props.type]: {
															metadata: search[props.type]?.metadata.map(
																(m) => {
																	if (m.key === filterMeta.key) {
																		return {
																			key: filterMeta.key,
																			value: value !== "" ? value : undefined,
																		};
																	}
																	return m;
																},
															),
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
						)}
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
	);
}
