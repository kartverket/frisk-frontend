import { Route } from "@/routes";
import { useIndicators } from "@/hooks/use-indicators.ts";
import { useFunction } from "@/hooks/use-function.tsx";
import type { BackendFunction } from "@/services/backend.ts";
import { Flex, Icon } from "@kvib/react";

export function IndicatorPointer({
	functionId,
}: {
	functionId: number;
}) {
	const { func } = useFunction(functionId, {
		includeAccess: true,
	});
	const search = Route.useSearch();
	const indicatorMetadataKey = search.indicators?.metadata.find((m) => m.key);

	const indicators = useIndicators(
		indicatorMetadataKey
			? {
					functionId,
					key: indicatorMetadataKey.key,
					value: indicatorMetadataKey.value as string,
				}
			: undefined,
	);

	const indicatorPointers = getIndicatorPointers(indicators.data, func.data);

	return (
		<Flex
			justifyContent="center"
			alignItems="center"
			direction="row"
			backgroundColor="blue.100"
			borderRadius="12px"
			width="44px"
			height="20px"
			marginRight="12px"
		>
			<Flex margin="0px" width="20px" style={{ rotate: "180deg" }}>
				<Icon
					aria-label="indicator_in_parent"
					icon="play_arrow"
					size={20}
					color={
						indicatorPointers.hasIndicatorInParent
							? "var(--kvib-colors-blue-500)"
							: "var(--kvib-colors-blue-50)"
					}
					isFilled={true}
					weight={400}
				/>
			</Flex>
			<Flex margin="0px -8px" width="20px">
				<Icon
					aria-label="indicator_here"
					icon="fiber_manual_record"
					size={20}
					color={
						indicatorPointers.hasIndicatorInSameLevel
							? "var(--kvib-colors-blue-500)"
							: "var(--kvib-colors-blue-50)"
					}
					isFilled={true}
					weight={400}
				/>
			</Flex>
			<Flex margin="0px" width="20px">
				<Icon
					aria-label="indicator_in_child"
					icon="play_arrow"
					size={20}
					color={
						indicatorPointers.hasIndicatorInChild
							? "var(--kvib-colors-blue-500)"
							: "var(--kvib-colors-blue-50)"
					}
					isFilled={true}
					weight={400}
				/>
			</Flex>
		</Flex>
	);
}

function getIndicatorPointers(
	indicators: BackendFunction[] | undefined,
	functionData: BackendFunction | undefined,
) {
	const functionPositionLength = functionData?.path.split(".").length ?? 0;
	const hasIndicatorInParent =
		indicators?.some(
			(indicator) =>
				indicator?.path.split(".").length - functionPositionLength < 0,
		) ?? false;
	const hasIndicatorInChild =
		indicators?.some(
			(indicator) =>
				indicator?.path.split(".").length - functionPositionLength > 0,
		) ?? false;
	const hasIndicatorInSameLevel =
		indicators?.some((indicator) => indicator.id === functionData?.id) ?? false;
	return { hasIndicatorInParent, hasIndicatorInSameLevel, hasIndicatorInChild };
}
