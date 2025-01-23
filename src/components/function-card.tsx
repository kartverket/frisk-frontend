import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, IconButton, Skeleton, Text } from "@kvib/react";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardSelectedView } from "./function-card-selected-view";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { useEffect, useState } from "react";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";

export function FunctionCard({
	functionId,
	selected,
	lowlighted,
}: { functionId: number; selected: boolean; lowlighted: boolean }) {
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

	const hasAccess = useHasFunctionAccess(functionId);

	return (
		<Card
			id={functionId.toString()}
			marginBottom={bottomMargin}
			borderColor="blue.500"
			opacity={lowlighted ? 0.5 : 1}
			borderWidth={1}
			onClick={() => {
				if (!func.data) return;
				if (search.edit !== undefined) {
					return;
				}
				if (selected) {
					const newPath = search.path.map((path) => {
						const funcId = func.data.id;
						if (path.includes(funcId.toString())) {
							const indexOfFuncId = path.split(".").indexOf(funcId.toString());
							const pathBeforeFuncPath = path
								.split(".")
								.slice(0, indexOfFuncId);
							return pathBeforeFuncPath.join(".");
						}
						return path;
					});
					navigate({
						search: {
							path: newPath,
							filters: search.filters,
							edit: search.edit,
							flags: search.flags,
						},
					});
				} else {
					navigate({
						search: {
							path: [
								...search.path.filter(
									(path) =>
										!func?.data?.path.includes(path) &&
										!path.includes(`${func?.data?.path}`),
								),
								func?.data?.path,
							],
							filters: search.filters,
							edit: search.edit,
							flags: search.flags,
						},
					});
				}
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
							isDisabled={false}
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
