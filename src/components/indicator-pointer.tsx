import { Route } from "@/routes";
import { useIndicators } from "@/hooks/use-indicators.ts";
import { useFunction } from "@/hooks/use-function.tsx";
import type { BackendFunction } from "@/services/backend.ts";
import { Flex, Icon, Tooltip, useTheme } from "@kvib/react";
import type { Metadata } from "../../frisk.config.tsx";

export function IndicatorPointer({
	functionId,
}: {
	functionId: number;
}) {
	const theme = useTheme();
	const { func } = useFunction(functionId);
	const search = Route.useSearch();
	const { config } = Route.useLoaderData();
	const indicatorMetadataKey = search.indicators?.metadata.find((m) => m.key);
	const selectedIndicator = config.metadata?.find(
		(m) => m.key === indicatorMetadataKey?.key,
	);

	const indicators = useIndicators(
		indicatorMetadataKey
			? {
					functionId,
					key: indicatorMetadataKey.key,
					value:
						indicatorMetadataKey.value &&
						typeof indicatorMetadataKey.value === "object" &&
						"value" in indicatorMetadataKey.value
							? (indicatorMetadataKey.value.value as string)
							: undefined,
				}
			: undefined,
	);

	const indicatorPointers = getIndicatorPointers(indicators.data, func.data);

	return (
		<Tooltip
			label={
				<TooltipIndicatorPointer
					indicatorPointers={indicatorPointers}
					selectedIndicator={selectedIndicator}
				/>
			}
		>
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
								? theme.colors.blue[500]
								: theme.colors.blue[50]
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
								? theme.colors.blue[500]
								: theme.colors.blue[50]
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
								? theme.colors.blue[500]
								: theme.colors.blue[50]
						}
						isFilled={true}
						weight={400}
					/>
				</Flex>
			</Flex>
		</Tooltip>
	);
}

export function TooltipIndicatorPointer({
	indicatorPointers,
	selectedIndicator,
}: {
	indicatorPointers: IndicatorPointers;
	selectedIndicator: Metadata | undefined;
}) {
	const parent = indicatorPointers.hasIndicatorInParent ? (
		<span>
			på et <b>høyere</b> funksjonsnivå
		</span>
	) : null;
	const here = indicatorPointers.hasIndicatorInSameLevel ? (
		<span>
			på <b>dette</b> funksjonsnivået
		</span>
	) : null;
	const child = indicatorPointers.hasIndicatorInChild ? (
		<span>
			på et <b>lavere</b> funksjonsnivå
		</span>
	) : null;

	const activeLevels = [parent, here, child].filter(Boolean);
	const selectedIndicatorText =
		selectedIndicator?.displayName ?? selectedIndicator?.key;
	const formatedSelectedIndicatorText = (
		<i>{selectedIndicatorText?.toLowerCase()}</i>
	);

	if (activeLevels.length === 0) {
		return (
			<span>
				Denne funksjonen har <b>ingen</b> relasjon til metadata{" "}
				{formatedSelectedIndicatorText}.
			</span>
		);
	}

	if (activeLevels.length === 1) {
		return (
			<span>
				Funksjonen har metadata {formatedSelectedIndicatorText}{" "}
				{activeLevels[0]}.
			</span>
		);
	}

	if (activeLevels.length >= 2) {
		return (
			<span>
				Funksjonen har metadata {formatedSelectedIndicatorText}:
				<ul style={{ margin: "0 0 0 1.2em" }}>
					{activeLevels.map((item, index) => (
						<li key={index}>{item}</li>
					))}
				</ul>
			</span>
		);
	}

	return null;
}

export type IndicatorPointers = {
	hasIndicatorInParent: boolean;
	hasIndicatorInSameLevel: boolean;
	hasIndicatorInChild: boolean;
};

function getIndicatorPointers(
	indicators: BackendFunction[] | undefined,
	functionData: BackendFunction | undefined,
): IndicatorPointers {
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
