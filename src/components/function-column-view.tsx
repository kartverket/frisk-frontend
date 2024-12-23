import { Button, Flex, Text, useToast } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";

import {
	DndContext,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import type { useFunction } from "@/hooks/use-function";
import { config } from "../../frisk.config";
import { getFunctionsCSVDump } from "@/services/backend";

type FunctionColumnViewProps = {
	path: string[];
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
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
			<DndContext onDragEnd={handleDragEnd} sensors={sensors}>
				<Flex>
					{selectedFunctionIds?.map((ids) => (
						<FunctionColumn key={ids[0]} functionIds={ids} />
					))}
				</Flex>
			</DndContext>
		</Flex>
	);
}
