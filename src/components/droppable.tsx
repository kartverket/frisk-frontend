import { useDroppable } from "@dnd-kit/core";

type DroppableProps = {
	groupId: number;
	droppableId: string;
	children: (props: {
		isOver: boolean;
		setNodeRef: (element: HTMLElement | null) => void;
	}) => React.ReactNode;
};

export function Droppable({ groupId, droppableId, children }: DroppableProps) {
	const { setNodeRef, over } = useDroppable({
		id: droppableId,
		data: {
			group: groupId,
		},
	});

	const isOver = over?.data.current?.group === groupId;

	return children({ isOver, setNodeRef });
}
