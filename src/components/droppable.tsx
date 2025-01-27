import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Box } from "@kvib/react";
import { useState, type ReactNode } from "react";
import { useFunction } from "@/hooks/use-function";

type DroppableProps = {
	functionId: number;
	droppableId: string;
	children: ReactNode;
};

export function Droppable({
	functionId,
	droppableId,
	children,
}: DroppableProps) {
	const { setNodeRef, over } = useDroppable({
		id: droppableId,

		data: {
			group: functionId,
		},
	});

	return (
		<Box
			ref={setNodeRef}
			padding={"8px"}
			backgroundColor={
				over?.data.current?.group === functionId ? "blue.100" : "gray.200"
			}
			borderRadius="md"
			border="1px"
			marginBottom={2}
		>
			{children}
		</Box>
	);
}
