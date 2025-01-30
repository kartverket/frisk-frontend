import type {
	InputMetadata,
	Metadata,
	SelectMetadata,
	SelectOption,
} from "../../../frisk.config";
import { useMetadata } from "@/hooks/use-metadata";
import {
	FormControl,
	FormLabel,
	Icon,
	Input,
	SearchAsync,
	Select,
	Skeleton,
	Text,
} from "@kvib/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";

type MetadataInputProps = {
	metadata: Metadata;
	parentFunctionId: number | undefined;
	functionId: number | undefined;
	onChange?: (value: string | string[]) => void;
	value?: string | MultiSelectOption[];
	hideLabel?: boolean;
};

export function MetadataInput({
	metadata,
	functionId,
	parentFunctionId,
	onChange,
	value,
	hideLabel,
}: MetadataInputProps) {
	const mode = functionId === undefined ? "create" : "update";
	const show = metadata.show(
		mode,
		true /* sets this to true now, but should actually be hasAccess */,
	);
	if (!show) return null;

	const metadataInputType = metadata.type;
	switch (metadataInputType) {
		case "select":
			return (
				<SelectInput
					metadata={metadata}
					functionId={functionId}
					parentFunctionId={parentFunctionId}
					onChange={onChange}
					value={value}
					hideLabel={hideLabel}
				/>
			);
		case "text":
		case "number":
		case "url":
			return (
				<InputField
					metadata={metadata}
					functionId={functionId}
					parentFunctionId={parentFunctionId}
					onChange={onChange}
					value={value as string}
					hideLabel={hideLabel}
				/>
			);
		default:
			metadataInputType satisfies never;
			console.error("Unsupported data type");
			return null;
	}
}

type SelectInputProps = {
	metadata: SelectMetadata;
	functionId: number | undefined;
	parentFunctionId: number | undefined;
	onChange?: (value: string | string[]) => void;
	value?: string | MultiSelectOption[];
	hideLabel?: boolean;
};

function SelectInput({
	metadata,
	functionId,
	parentFunctionId,
	onChange,
	value,
	hideLabel,
}: SelectInputProps) {
	const {
		metadata: { data: currentMetadata },
	} = useMetadata(functionId);

	const metadataToDisplay = currentMetadata?.filter(
		(m) => metadata.key === m.key,
	);

	const currentMetadataValue = currentMetadata?.find(
		(m) => metadata.key === m.key,
	)?.value;

	const displayValues = useQueries({
		queries:
			metadataToDisplay?.map((m) => ({
				queryKey: [functionId, metadata.key, m.value, "getDisplayValue"],
				queryFn: async () => {
					return metadata.getDisplayValue?.(m);
				},
			})) ?? [],
	});

	const currentMetadataValues = metadataToDisplay?.map((m, i) => ({
		value: m.value,
		label: displayValues[i].data?.displayValue ?? m.value,
	}));

	const [newMetadataValues, setCurrentMetadataValues] = useState<
		MultiSelectOption[] | undefined
	>();

	const { metadata: parentMetadata } = useMetadata(parentFunctionId);

	const parentMetadataToDisplay = parentMetadata.data?.filter(
		(m) => metadata.key === m.key,
	);

	const parentMetadataValue = parentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	const parentDisplayValues = useQueries({
		queries:
			parentMetadataToDisplay?.map((m) => ({
				queryKey: [parentFunctionId, metadata.key, m.value, "getDisplayValue"],
				queryFn: async () => {
					return metadata.getDisplayValue?.(m);
				},
			})) ?? [],
	});

	const parentMetadataValues: MultiSelectOption[] | undefined =
		parentMetadataToDisplay?.map((m, i) => ({
			value: m.value,
			label: parentDisplayValues[i].data?.displayValue ?? m.value,
		})) ?? [];

	const options = useQuery({
		queryKey: [metadata.key, "getOptions"],
		queryFn: metadata.getOptions,
	});

	return (
		<FormControl isRequired={metadata.isRequired}>
			{!hideLabel && (
				<FormLabel
					style={{
						fontSize: "small",
						fontWeight: "medium",
					}}
				>
					{metadata.label}
				</FormLabel>
			)}
			<Skeleton isLoaded={!options.isLoading} fitContent>
				{options.isSuccess ? (
					metadata.selectMode === "single" ? (
						<SingleSelect
							options={options}
							metadata={metadata}
							currentMetadataValue={currentMetadataValue}
							parentMetadataValue={parentMetadataValue}
							onChange={onChange}
							value={value as string}
						/>
					) : (
						<MultiSelect
							options={options}
							metadata={metadata}
							currentMetadataValues={newMetadataValues ?? currentMetadataValues}
							parentMetadataValues={parentMetadataValues}
							setCurrentMetadataValues={setCurrentMetadataValues}
							onChange={onChange}
							value={value as MultiSelectOption[]}
						/>
					)
				) : options.isError ? (
					<Text>Det skjedde en feil</Text>
				) : null}
			</Skeleton>
		</FormControl>
	);
}

type SingleSelectProps = {
	metadata: SelectMetadata;
	options: UseQueryResult<SelectOption[]>;
	currentMetadataValue: string | undefined;
	parentMetadataValue: string | undefined;
	onChange?: (value: string | string[]) => void;
	value?: string;
};

function SingleSelect({
	metadata,
	options,
	currentMetadataValue,
	parentMetadataValue,
	onChange,
	value,
}: SingleSelectProps) {
	return (
		<Select
			name={metadata.key}
			size="sm"
			backgroundColor="white"
			placeholder={metadata.placeholder}
			defaultValue={
				currentMetadataValue ??
				(metadata.inheritFromParent ? parentMetadataValue : undefined)
			}
			onChange={(e) => {
				onChange?.(e.target.value);
			}}
			value={value}
		>
			{options.data?.map((option) => (
				<option key={option.value} value={option.value}>
					{option.name}
				</option>
			))}
		</Select>
	);
}

export type MultiSelectOption = {
	value: string;
	label: string;
};

type MultiSelectProps = {
	metadata: SelectMetadata;
	options: UseQueryResult<SelectOption[]>;
	currentMetadataValues: MultiSelectOption[] | undefined;
	parentMetadataValues: MultiSelectOption[] | undefined;
	setCurrentMetadataValues: (values: MultiSelectOption[]) => void;
	onChange?: (value: string[]) => void;
	value?: MultiSelectOption[];
};

function MultiSelect({
	metadata,
	options,
	currentMetadataValues,
	parentMetadataValues,
	setCurrentMetadataValues,
	onChange,
	value: overrideValue,
}: MultiSelectProps) {
	const value =
		currentMetadataValues ??
		(metadata.inheritFromParent ? parentMetadataValues : undefined) ??
		[];

	return (
		<>
			<SearchAsync
				size="sm"
				value={overrideValue ?? value}
				isMulti
				debounceTime={100}
				defaultOptions
				dropdownIndicator={<Icon icon="expand_more" weight={400} />}
				loadOptions={(inputValue, callback) => {
					const filteredOptions = options.data
						?.filter((option) =>
							option.name.toLowerCase().includes(inputValue.toLowerCase()),
						)
						.map((option) => ({
							value: option.value,
							label: option.name,
						}));
					// @ts-expect-error
					callback(filteredOptions);
				}}
				onChange={(newValue) => {
					// @ts-expect-error
					setCurrentMetadataValues(newValue ?? []);
					// @ts-expect-error
					onChange?.(newValue ?? []);
				}}
				placeholder="Søk"
			/>
			<Input type="hidden" name={metadata.key} value={JSON.stringify(value)} />
		</>
	);
}

type InputProps = {
	metadata: InputMetadata;
	functionId: number | undefined;
	parentFunctionId: number | undefined;
	onChange?: (value: string | string[]) => void;
	value?: string;
	hideLabel?: boolean;
};

function InputField({
	metadata,
	functionId,
	parentFunctionId,
	onChange,
	value,
	hideLabel,
}: InputProps) {
	const { metadata: currentMetadata } = useMetadata(functionId);
	const { metadata: parentMetadata } = useMetadata(parentFunctionId);

	const currentMetadataValue = currentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	const parentMetadataValue = parentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	return (
		<FormControl isRequired={metadata.isRequired}>
			{!hideLabel && (
				<FormLabel style={{ fontSize: "small", fontWeight: "medium" }}>
					{metadata.label}
				</FormLabel>
			)}
			<Input
				type={metadata.type}
				name={metadata.key}
				defaultValue={
					currentMetadataValue ??
					(metadata.inheritFromParent ? parentMetadataValue : undefined)
				}
				onChange={(e) => {
					onChange?.(e.target.value);
				}}
				placeholder={metadata.placeholder}
				size="sm"
				borderRadius="5px"
				value={value}
			/>
		</FormControl>
	);
}
