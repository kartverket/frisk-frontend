import { useDroppable } from "@dnd-kit/core";

type DroppableProps = {
	groupId: number;
	droppableId: string;
	orderIndex: number;
	children: (props: {
		isOver: boolean;
		setNodeRef: (element: HTMLElement | null) => void;
	}) => React.ReactNode;
};

export function Droppable({
	groupId,
	orderIndex,
	droppableId,
	children,
}: DroppableProps) {
	const { setNodeRef, over } = useDroppable({
		id: droppableId,
		data: {
			group: groupId,
			order: orderIndex,
		},
	});

	const isOver = over?.data.current?.group === groupId;

	return children({ isOver, setNodeRef });
}
