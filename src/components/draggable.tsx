import { useFunction } from "@/hooks/use-function";
import { useDraggable } from "@dnd-kit/core";
import type { ReactNode } from "react";

type DraggableProps = {
	functionId: number;
	children: ReactNode;
};

export function Draggable({ functionId, children }: DraggableProps) {
	const { func, updateFunction } = useFunction(functionId);

	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: functionId,
		data: {
			func: func.data,
			update: updateFunction,
		},
	});

	const dragableStyle = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		: undefined;
	return (
		<div ref={setNodeRef} {...listeners} {...attributes} style={dragableStyle}>
			{children}
		</div>
	);
}
