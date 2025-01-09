import { Flex, IconButton, Text, Icon, useTheme } from "@kvib/react";
import { Route } from "@/routes";
import { useFunction } from "@/hooks/use-function";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";

export function EditAndSelectButtons({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const { config } = Route.useLoaderData();
	const theme = useTheme();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { children } = useFunction(functionId, {
		includeChildren: true,
	});

	const hasAccess = config.enableEntra
		? useHasFunctionAccess(functionId)
		: true;

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
			<Flex
				border="1px"
				borderColor="blue.500"
				borderRadius="5px"
				alignItems="center"
				bgColor={selected ? "blue.500" : "white"}
				p="2px"
				pl="10px"
				gap="4px"
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
		</Flex>
	);
}
