import { Button, Flex, Text, useToast } from "@kvib/react";
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
import { SearchField } from "./search-field";
import { FunctionCard } from "./function-card";
import { useState } from "react";
import { FilterMenu } from "@/components/filter-menu.tsx";

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
			<Text fontSize="sm" marginBottom="38">
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
				<FilterMenu />
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
