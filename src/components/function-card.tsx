import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, IconButton, Skeleton, Stack, Text } from "@kvib/react";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardExpandableContent } from "./function-card-expandable-content";
import { EditAndSelectButtons } from "./edit-and-select-buttons";
import { useEffect, useMemo, useState } from "react";
import { useHasFunctionAccess } from "@/hooks/use-has-function-access";

export function FunctionCard({
	functionId,
	selected,
	lowlighted,
}: { functionId: number; selected: boolean; lowlighted: boolean }) {
	const { config } = Route.useLoaderData();
	const { func } = useFunction(functionId);
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const isCardExpanded = useMemo(() => {
		return search.expandedCards?.includes(functionId) ?? false;
	}, [functionId, search.expandedCards]);

	const toggleCardExpanded = () => {
		navigate({
			search: {
				...search,
				expandedCards: isCardExpanded
					? search.expandedCards?.filter((id) => id !== functionId)
					: [...(search.expandedCards ?? []), functionId],
			},
		});
	};

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
						expandedCards: search.expandedCards,
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
				) : (
					<Stack w="100%">
						<Flex alignItems="center" w="100%" flex-wrap="wrap">
							<IconButton
								type="button"
								colorScheme="gray"
								variant="ghost"
								aria-label="drag"
								icon="drag_indicator"
								isDisabled={!hasAccess}
							/>
							<IconButton
								colorScheme="gray"
								variant="tertiary"
								aria-label={isCardExpanded ? "close card" : "expand card"}
								icon={isCardExpanded ? "keyboard_arrow_down" : "chevron_right"}
								onClick={(e) => {
									e.stopPropagation();
									toggleCardExpanded();
								}}
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
							<EditAndSelectButtons
								functionId={functionId}
								selected={selected}
							/>
						</Flex>
						{isCardExpanded && (
							<FunctionCardExpandableContent functionId={functionId} />
						)}
					</Stack>
				)}
			</Flex>
		</Card>
	);
}
