import { Route } from "@/routes";
import {
	Box,
	Flex,
	Icon,
	IconButton,
	Select,
	Text,
	Tooltip,
	useTheme,
} from "@kvib/react";
import {
	MetadataInput,
	type MultiSelectOption,
} from "@/components/metadata/metadata-input.tsx";

export function FilterMenu() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	function removeMetadata(type: "filters" | "indicators", key: string) {
		const updatedFilters = search[type]?.metadata.filter((m) => m.key !== key);
		if (updatedFilters?.length === 0) {
			navigate({
				search: {
					...search,
					[type]: undefined,
				},
			});
		} else {
			updateMetadata(type, updatedFilters);
		}
	}

	function updateMetadata(
		type: "filters" | "indicators",
		updatedFilters:
			| {
					key: string;
					value?: unknown;
			  }[]
			| undefined,
	) {
		navigate({
			search: {
				...search,
				...(search[type]
					? {
							[type]: {
								metadata: updatedFilters ?? [],
							},
						}
					: {}),
			},
		});
	}

	function addMetadata(type: "filters" | "indicators", key: string) {
		navigate({
			search: {
				...search,
				[type]: {
					metadata: [...(search[type]?.metadata ?? []), { key: key }],
				},
			},
		});
	}

	return (
		<Flex gap="6">
			<Filters
				type="filters"
				addMetadata={addMetadata}
				removeMetadata={removeMetadata}
				updateMetadata={updateMetadata}
			/>
			<Indicators
				type="indicators"
				addMetadata={addMetadata}
				removeMetadata={removeMetadata}
				updateMetadata={updateMetadata}
			/>
		</Flex>
	);
}

function Filters(props: {
	type: "filters" | "indicators";
	addMetadata: (type: "filters" | "indicators", key: string) => void;
	removeMetadata: (type: "filters" | "indicators", key: string) => void;
	updateMetadata: (
		type: "filters" | "indicators",
		updatedFilters:
			| {
					key: string;
					value?: unknown;
			  }[]
			| undefined,
	) => void;
}) {
	const search = Route.useSearch();
	const selectedFilters = search[props.type]?.metadata;
	const { config } = Route.useLoaderData();

	return (
		<Flex flexDirection="column" gap={1}>
			<Flex alignItems="center" gap="1">
				<Text fontSize="sm" as="b" color="blue.500">
					Filter
				</Text>
			</Flex>
			<Select
				size="sm"
				backgroundColor="white"
				placeholder={`Legg til filter`}
				onChange={(e) => {
					if (e.target.value) {
						props.addMetadata(props.type, e.target.value);
					}
				}}
			>
				{config.metadata
					?.filter((m) => !selectedFilters?.some((f) => f.key === m.key))
					.map((m) => {
						return (
							<option key={m.key} value={m.key}>
								{m.displayName ?? m.key}
							</option>
						);
					})}
			</Select>

			{selectedFilters?.map((selectedFilter) => {
				const metadataForFilter = config.metadata?.find(
					(m) => m.key === selectedFilter.key,
				);
				if (!metadataForFilter) {
					return null;
				}
				return (
					<Flex
						key={selectedFilter.key + selectedFilter.value}
						gap={1}
						alignItems="center"
					>
						<Select
							size="sm"
							backgroundColor="white"
							value={selectedFilter.key}
							placeholder="Fjern filter"
							onChange={(e) => {
								if (e.target.value) {
									const updatedFilters = search[props.type]?.metadata.map(
										(m) => {
											if (m.key === selectedFilter.key) {
												return { key: e.target.value };
											}
											return m;
										},
									);
									props.updateMetadata(props.type, updatedFilters);
								} else {
									props.removeMetadata(props.type, selectedFilter.key);
								}
							}}
						>
							{config.metadata
								?.filter(
									(m) =>
										m.key === selectedFilter.key ||
										!search[props.type]?.metadata?.some((f) => f.key === m.key),
								)
								.map((m) => {
									return (
										<option key={m.key} value={m.key}>
											{m.displayName ?? m.key}
										</option>
									);
								})}
						</Select>
						{metadataForFilter.type === "select" && (
							<MetadataInput
								hideLabel
								value={selectedFilter.value as string | MultiSelectOption[]}
								onChange={(value) => {
									const updatedFilterValue = search[props.type]?.metadata.map(
										(m) => {
											if (m.key === selectedFilter.key) {
												return {
													key: selectedFilter.key,
													value: value !== "" ? value : undefined,
												};
											}
											return m;
										},
									);
									props.updateMetadata(props.type, updatedFilterValue);
								}}
								metadata={metadataForFilter}
								functionId={undefined}
								parentFunctionId={undefined}
							/>
						)}
						<IconButton
							aria-label="Remove filter"
							onClick={() => {
								props.removeMetadata(props.type, selectedFilter.key);
							}}
							icon="delete"
							colorScheme="red"
							variant="ghost"
						/>
					</Flex>
				);
			})}
		</Flex>
	);
}

function Indicators(props: {
	type: "filters" | "indicators";
	addMetadata: (type: "filters" | "indicators", key: string) => void;
	removeMetadata: (type: "filters" | "indicators", key: string) => void;
	updateMetadata: (
		type: "filters" | "indicators",
		updatedFilters:
			| {
					key: string;
					value?: unknown;
			  }[]
			| undefined,
	) => void;
}) {
	const { config } = Route.useLoaderData();
	const search = Route.useSearch();
	const theme = useTheme();

	const selectedIndicator = search.indicators?.metadata.find((m) => m.key);
	const selectedIndicatorMetadata = config.metadata?.find(
		(m) => m.key === selectedIndicator?.key,
	);

	const metadataOptions = config.metadata?.filter(
		(m) => !(m.type === "select" && m.selectMode === "multi"),
	);

	return (
		<Flex flexDirection="column" gap={1}>
			<Flex alignItems="center" gap="1">
				<Text fontSize="sm" as="b" color="blue.500">
					Indikator
				</Text>
				<Tooltip label="Viser indikatorer om metadata finnes på under-/overfunksjoner">
					<Box as="span" display="inline-flex" alignItems="center">
						<Icon
							aria-label="info"
							icon="info"
							size={21}
							color={theme.colors.blue[500]}
						/>
					</Box>
				</Tooltip>
			</Flex>
			<Flex gap={1} alignItems="center">
				<div style={{ position: "relative" }}>
					<Select
						size="sm"
						backgroundColor="white"
						placeholder="Velg indikator"
						value={
							selectedIndicatorMetadata
								? selectedIndicatorMetadata.key
								: "Velg indikator"
						}
						onChange={(e) => {
							if (e.target.value) {
								if (!selectedIndicatorMetadata) {
									props.addMetadata(props.type, e.target.value);
								} else {
									props.updateMetadata(props.type, [{ key: e.target.value }]);
								}
							} else {
								if (selectedIndicatorMetadata)
									props.removeMetadata(
										props.type,
										selectedIndicatorMetadata?.key,
									);
							}
						}}
					>
						{metadataOptions?.map((m) => {
							return (
								<option key={m.key} value={m.key}>
									{m.displayName ?? m.key}
								</option>
							);
						})}
					</Select>
					{selectedIndicator && (
						<IconButton
							position="absolute"
							top="1px"
							right="25px"
							aria-label="Remove indicator"
							variant="tertiary"
							size="sm"
							color="black"
							colorScheme={"red"}
							onClick={(e) => {
								e.stopPropagation();
								props.removeMetadata(props.type, selectedIndicator.key);
							}}
							icon={"close"}
						/>
					)}
				</div>

				{selectedIndicator && selectedIndicatorMetadata?.type === "select" && (
					<MetadataInput
						hideLabel
						value={selectedIndicator.value as string | MultiSelectOption[]}
						onChange={(value) => {
							const updatedFilterValue = search[props.type]?.metadata.map(
								(m) => {
									if (m.key === selectedIndicator.key) {
										return {
											key: selectedIndicator.key,
											value: value !== "" ? value : undefined,
										};
									}
									return m;
								},
							);
							props.updateMetadata(props.type, updatedFilterValue);
						}}
						metadata={selectedIndicatorMetadata}
						functionId={undefined}
						parentFunctionId={undefined}
					/>
				)}
			</Flex>
		</Flex>
	);
}
