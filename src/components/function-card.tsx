import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, Icon, IconButton, Text } from "@kvib/react";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardSelectedView } from "./function-card-selected-view";

export function FunctionCard({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const { func } = useFunction(functionId);
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<Card
			borderColor="blue.500"
			borderWidth={1}
			onClick={(e) => {
				e.preventDefault();
				navigate({ search: { path: func.data?.path, edit: search.edit } });
			}}
		>
			<Flex
				bgColor={selected && search.edit === undefined ? "blue.50" : undefined}
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
							style={{ pointerEvents: "auto" }}
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								navigate({ search: { ...search, edit: functionId } });
							}}
						/>
						<Icon icon={"arrow_forward_ios"} />
					</>
				)}
			</Flex>
		</Card>
	);
}
