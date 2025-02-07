import { Flex, IconButton, Text, Icon, useTheme } from "@kvib/react";
import { Route } from "@/routes";
import { useFunction } from "@/hooks/use-function";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";
import { Droppable } from "./droppable";

export function EditAndSelectButtons({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const theme = useTheme();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { children } = useFunction(functionId, {
		includeChildren: true,
	});

	const hasAccess = useHasFunctionAccess(functionId);

	return (
		<Flex gap="2px">
			<IconButton
				isDisabled={!hasAccess}
				type="button"
				colorScheme="gray"
				variant="ghost"
				aria-label="edit"
				icon="edit"
				style={{ pointerEvents: "auto" }}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					navigate({ search: { ...search, edit: functionId } });
				}}
			/>
			<Droppable groupId={functionId} droppableId={`${functionId}-self`}>
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
		</Flex>
	);
}
