import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { useDraggable } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

type DraggableProps = {
	functionId: number;
	children: (props: {
		listeners: SyntheticListenerMap | undefined;
	}) => React.ReactNode;
};

export function Draggable({ functionId, children }: DraggableProps) {
	const { edit } = Route.useSearch();
	const { func, access, updateFunction } = useFunction(functionId, {
		includeAccess: true,
	});

	const { isDragging, attributes, listeners, setNodeRef } = useDraggable({
		id: functionId,
		data: {
			func: func.data,
			update: updateFunction,
		},
		disabled: edit === functionId || !access,
	});

	const dragableStyle = isDragging
		? {
				opacity: "50%",
			}
		: undefined;
	return (
		<div ref={setNodeRef} {...attributes} style={dragableStyle}>
			{children({ listeners })}
		</div>
	);
}
