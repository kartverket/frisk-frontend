import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, IconButton, Skeleton, Text } from "@kvib/react";
import { FunctionCardEdit } from "./function-card-edit";
import { FunctionCardSelectedView } from "./function-card-selected-view";
import { SelectButton } from "./buttons/select-button.tsx";
import { useEffect, useState } from "react";
import { Draggable } from "./draggable";
import { css, keyframes } from "@emotion/react";

export function FunctionCard({
	functionId,
	selected,
	lowlighted,
}: { functionId: number; selected: boolean; lowlighted: boolean }) {
	// const { config } = Route.useLoaderData();
	const { func, functionAccess } = useFunction(functionId, {
		includeAccess: true,
	});
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const [bottomMargin, setBottomMargin] = useState(0);

	useEffect(() => {
		function getParentDistance() {
			const childrenGroup = document.getElementById(`${functionId}-children`);
			const self = document.getElementById(functionId.toString());
			if (!childrenGroup || !self) return 0;

			const cHeight = childrenGroup.getBoundingClientRect().height;
			const sHeight = self.getBoundingClientRect().height;
			return cHeight > sHeight ? cHeight - sHeight : 2;
		}
		setBottomMargin(getParentDistance());

		const observer = new MutationObserver(() => {
			setBottomMargin(getParentDistance());
		});

		const root = document.getElementById("root");
		if (!root) return;
		observer.observe(root, {
			attributes: true,
			childList: true,
			subtree: true,
		});

		() => {
			observer.disconnect();
		};
	}, [functionId]);

	useEffect(() => {
		if (search.highlighted === functionId) {
			const timeout = setTimeout(() => {
				navigate({
					search: {
						...search,
						highlighted: undefined,
					},
				});
			}, 2000);
			return () => {
				clearTimeout(timeout);
			};
		}
	}, [search, functionId, navigate]);

	const highlightBorder = keyframes`
	0% {
	  outline: 1px solid black;
	}
	50% {
	  outline: 3px solid black;
	}
	100% {
	  outline: 1px solid black;
	}
  `;

	return (
		<Draggable functionId={functionId}>
			{({ listeners }) => (
				<Card
					id={functionId.toString()}
					ref={(e) => {
						if (search.highlighted === functionId) {
							e?.scrollIntoView({ behavior: "smooth" });
						}
					}}
					marginBottom={bottomMargin}
					borderColor="blue.500"
					opacity={lowlighted ? 0.5 : 1}
					borderWidth={1}
					css={
						search.highlighted === functionId
							? css`
						animation:  ${highlightBorder} 1s ease;
					  `
							: undefined
					}
					onClick={() => {
						if (!func.data) return;
						if (search.edit !== undefined) {
							return;
						}
						navigate({
							search: {
								...search,
								path: [
									...search.path.filter(
										(path) =>
											!func?.data?.path.includes(path) &&
											!path.includes(`${func?.data?.path}`),
									),
									...(search.path.includes(`${func?.data?.path}`)
										? [
												func?.data?.path.slice(
													0,
													func?.data?.path.lastIndexOf("."),
												),
											]
										: [`${func?.data?.path}`]),
								],
							},
						});
						if (selected) {
							const newPath = search.path.map((path) => {
								const funcId = func.data.id;
								if (path.includes(funcId.toString())) {
									const indexOfFuncId = path
										.split(".")
										.indexOf(funcId.toString());
									const pathBeforeFuncPath = path
										.split(".")
										.slice(0, indexOfFuncId);
									return pathBeforeFuncPath.join(".");
								}
								return path;
							});
							navigate({
								search: {
									...search,
									path: newPath,
								},
							});
						} else {
							navigate({
								search: {
									...search,
									path: [
										...search.path.filter(
											(path) =>
												!func?.data?.path.includes(path) &&
												!path.includes(`${func?.data?.path}`),
										),
										func?.data?.path,
									],
								},
							});
						}
					}}
				>
					<Flex
						bgColor={
							selected && search.edit !== functionId ? "blue.50" : undefined
						}
						display="flex"
						borderRadius="inherit"
						alignItems="center"
						p="2"
						minWidth={0}
						flex-wrap="wrap"
					>
						{search.edit === functionId && functionAccess ? (
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
									isDisabled={!functionAccess}
									{...listeners}
								/>
								<Skeleton isLoaded={!func.isLoading} flex="1" minWidth={0} paddingRight={1}>
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
								<SelectButton functionId={functionId} selected={false} />
							</>
						)}
					</Flex>
				</Card>
			)}
		</Draggable>
	);
}
