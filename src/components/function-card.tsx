import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, IconButton, Skeleton, Text } from "@kvib/react";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardSelectedView } from "./function-card-selected-view";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { useEffect, useState } from "react";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";
import { test } from "@/hooks/use-test";

export function FunctionCard({
	functionId,
	selected,
	lowlighted,
}: { functionId: number; selected: boolean; lowlighted: boolean }) {
	const { config } = Route.useLoaderData();
	const { func } = useFunction(functionId);
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const [bottomMargin, setBottomMargin] = useState(0);

	test(
		"rr-skjema",
		"9360a014-493a-4a2b-9b9a-1f8d93dbbce7:splitTarget:Sikkerhetskontrollere:splitTarget:Malin",
		"1",
	);

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
			opacity={lowlighted ? 0.5 : 1}
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
						filters: search.filters,
						edit: search.edit,
						flags: search.flags,
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
							isDisabled={!hasAccess}
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
