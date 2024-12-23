import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, IconButton, Skeleton, Text } from "@kvib/react";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardSelectedView } from "./function-card-selected-view";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { useEffect, useState } from "react";
import { config } from "../../frisk.config";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";

export function FunctionCard({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const { func } = useFunction(functionId);
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const [bottomMargin, setBottomMargin] = useState(0);

	function getParentDistance() {
		const childrenGroup = document.getElementById(`${functionId}-children`);
		const self = document.getElementById(functionId.toString());
		if (!childrenGroup || !self) return 0;

		const cHeight = childrenGroup.getBoundingClientRect().height;
		const sHeight = self.getBoundingClientRect().height;
		return cHeight > sHeight ? cHeight - sHeight : 2;
	}
	useEffect(() => {
		setBottomMargin(getParentDistance());
	});

	const hasAccess = config.enableEntra
		? useHasFunctionAccess(functionId)
		: true;

	return (
		<Card
			id={functionId.toString()}
			marginBottom={bottomMargin}
			borderColor="blue.500"
			borderWidth={1}
			onClick={() => {
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
							...(search.path.includes(`${func?.data?.path}`)
								? [func?.data?.path.slice(0, func?.data?.path.lastIndexOf("."))]
								: [`${func?.data?.path}`]),
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
				minWidth={0}
				flex-wrap="wrap"
			>
				{search.edit === functionId && hasAccess ? (
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
						<Skeleton isLoaded={!func.isLoading} flex="1" minWidth={0}>
							<Text
								fontWeight="bold"
								as="span"
								display="flex"
								w="100%"
								overflow="hidden"
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
