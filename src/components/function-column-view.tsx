import { Flex, Text } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";

import {
	DndContext,
	DragOverlay,
	DragStartEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import type { useFunction } from "@/hooks/use-function";
import { config } from "../../frisk.config";
import { createPortal } from "react-dom";
import { useState } from "react";
import { FunctionCard } from "./function-card";

type FunctionColumnViewProps = {
	path: string[];
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
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
		setActiveId(null);
	}

	function handleDragStart(event: DragStartEvent) {
		setActiveId(Number(event.active.id));
	}

	return (
		<Flex flexDirection="column" paddingY="38" paddingX="100" marginBottom="76">
			<Text fontSize="2xl" fontWeight="700" marginBottom="3">
				{config.title}
			</Text>
			<Text fontSize="xs" marginBottom="38">
				{config.description}
			</Text>
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<Flex>
					{selectedFunctionIds?.map((ids) => (
						<FunctionColumn key={ids[0]} functionIds={ids} />
					))}
				</Flex>
				{/* {createPortal( */}
				<DragOverlay>
					{activeId ? (
						<FunctionCard functionId={activeId} selected={false} />
					) : null}
				</DragOverlay>

				{/* document.body,
				)} */}
			</DndContext>
		</Flex>
	);
}
