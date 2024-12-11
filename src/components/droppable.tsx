import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { Box } from "@kvib/react";
import { useState, type ReactNode } from "react";
import { useFunction } from "@/hooks/use-function";

type DroppableProps = {
	id: number;
	children: ReactNode;
};

export function Droppable({ id, children }: DroppableProps) {
	const { func } = useFunction(id);

	const [disabled, setDisabled] = useState<boolean>(false);

	const { isOver, setNodeRef } = useDroppable({
		id: id,
		disabled: disabled,
	});

	useDndMonitor({
		onDragOver(event) {
			const { active, over } = event;
			if (func?.data && over && active.data.current) {
				if (over.id === id && active.data.current.func.parentId === over.id) {
					setDisabled(true);
				} else if (over.id === id) {
					setDisabled(func.data.path.includes(active.id.toString()));
				}
			}
		},
		onDragEnd() {
			setDisabled(false);
		},
	});

	return (
		<Box
			ref={setNodeRef}
			padding={"8px"}
			backgroundColor={isOver ? "blue.100" : "gray.200"}
			borderRadius="md"
			border="1px"
			marginBottom={2}
		>
			{children}
		</Box>
	);
}
