import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { useDraggable } from "@dnd-kit/core";
import type { ReactNode } from "react";

type DraggableProps = {
	functionId: number;
	children: ReactNode;
	hasAccess?: boolean;
};

export function Draggable({
	functionId,
	children,
	hasAccess = true,
}: DraggableProps) {
	const { edit } = Route.useSearch();
	const { func, updateFunction } = useFunction(functionId);

	const { isDragging, attributes, listeners, setNodeRef } = useDraggable({
		id: functionId,
		data: {
			func: func.data,
			update: updateFunction,
		},
		disabled: edit === functionId || !hasAccess,
	});

	const dragableStyle = isDragging
		? {
				opacity: "50%",
			}
		: undefined;
	return (
		<div ref={setNodeRef} {...listeners} {...attributes} style={dragableStyle}>
			{children}
		</div>
	);
}
