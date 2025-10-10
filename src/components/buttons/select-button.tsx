import { Flex, Text, Icon, useTheme } from "@kvib/react";
import { useFunction } from "@/hooks/use-function.tsx";
import { Droppable } from "../droppable.tsx";

export function SelectButton({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const theme = useTheme();
	const { children } = useFunction(functionId, {
		includeChildren: true,
		includeAccess: true,
	});

	return (
		<Droppable
			groupId={functionId}
			droppableId={`${functionId}-self`}
			orderIndex={children.data?.length ?? 0}
		>
			{({ isOver, setNodeRef }) => (
				<Flex
					border="1px"
					borderColor="blue.500"
					borderRadius="5px"
					alignItems="center"
					bgColor={isOver ? "blue.100" : selected ? "blue.500" : "white"}
					p="2px"
					pl="10px"
					gap="4px"
					ref={setNodeRef}
					height="40px"
				>
					<Text
						fontSize="xs"
						fontWeight="semibold"
						color={selected ? "white" : "blue.500"}
					>
						{children.data?.length}
					</Text>
					<Icon
						icon={selected ? "arrow_back_ios" : "arrow_forward_ios"}
						color={selected ? "white" : theme.colors.blue[500]}
					/>
				</Flex>
			)}
		</Droppable>
	);
}
