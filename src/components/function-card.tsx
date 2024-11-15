import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, IconButton, Skeleton, Text } from "@kvib/react";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardSelectedView } from "./function-card-selected-view";
import { EditAndSelectButtons } from "./edit-and-select-buttons";

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
				console.log("PAAATH", search.path);
				console.log("PAAATH", func?.data?.path);
				console.log(
					search.path.filter((path) => path !== `${func?.data?.path}`),
				);
				if (search.edit !== undefined) {
					return;
				}
				navigate({
					search: {
						path: [
							...search.path.filter(
								(path) =>
									!func?.data?.path.includes(path) &&
									!path.includes(`${func?.data?.path}`),
							),
							`${func?.data?.path}`,
						],

						edit: search.edit,
					},
				});
			}}
		>
			<Flex
				bgColor={selected && search.edit !== functionId ? "blue.50" : undefined}
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
						<IconButton
							type="button"
							colorScheme="gray"
							variant="ghost"
							aria-label="drag"
							icon="drag_indicator"
						/>
						<Skeleton isLoaded={!func.isLoading} fitContent w="100%">
							<Text
								fontWeight="bold"
								as="span"
								display="flex"
								w="100%"
								paddingLeft="10px"
							>
								{func.data?.name ?? "<Det skjedde en feil>"}
							</Text>
						</Skeleton>
						<EditAndSelectButtons functionId={functionId} selected={false} />
					</>
				)}
			</Flex>
		</Card>
	);
}
