import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, Icon, IconButton, Text } from "@kvib/react";
import { Link as TSRLink } from "@tanstack/react-router";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardSelectedView } from "./function-card-selected-view";
import { useDraggable, useDroppable } from "@dnd-kit/core";

export function FunctionCard({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const { func, updateFunction } = useFunction(functionId);
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const {
		attributes,
		listeners,
		setNodeRef: setDraggableRef,
		transform,
	} = useDraggable({
		id: functionId,
		data: {
			func: func.data,
			update: updateFunction,
		},
	});

	const { isOver, setNodeRef: setDroppableRef } = useDroppable({
		id: functionId,
	});

	const setRefs = (node: HTMLElement | null) => {
		setDraggableRef(node);
		setDroppableRef(node);
	};

	const dragableStyle = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		: undefined;

	return (
		<Card
			borderColor="blue.500"
			borderWidth={1}
			ref={setRefs}
			{...listeners}
			{...attributes}
			style={dragableStyle}
			onClick={(e) => e.preventDefault()}
		>
			<TSRLink
				to={Route.to}
				search={{ path: func.data?.path, edit: search.edit }}
				style={{ borderRadius: "inherit" }}
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				<Flex
					bgColor={
						(selected && search.edit === undefined) || isOver
							? "blue.50"
							: undefined
					}
					display="flex"
					borderRadius="inherit"
					alignItems="center"
					p="2"
				>
					{search.edit === functionId ? (
						<FunctionCardEdit functionId={functionId} />
					) : selected ? (
						<FunctionCardSelectedView functionId={functionId} />
					) : (
						<>
							<Text
								fontWeight="bold"
								as="span"
								display="flex"
								w="100%"
								paddingLeft="10px"
							>
								{func.data?.name}
							</Text>
							<IconButton
								type="button"
								colorScheme="gray"
								variant="ghost"
								aria-label="edit"
								icon="edit"
								onClick={(e) => {
									e.preventDefault();
									navigate({ search: { ...search, edit: functionId } });
								}}
							/>
							<Icon icon={"arrow_forward_ios"} />
						</>
					)}
				</Flex>
			</TSRLink>
		</Card>
	);
}
