import type {
	config,
	InputMetadata,
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
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";

type MetadataInputProps = {
	metadata: (typeof config.metadata)[number];
	parentFunctionId: number;
	functionId: number | undefined;
};

export function MetadataInput({
	metadata,
	functionId,
	parentFunctionId,
}: MetadataInputProps) {
	const metadataType = metadata.type;
	switch (metadataType) {
		case "select":
			return (
				<SelectInput
					metadata={metadata}
					functionId={functionId}
					parentFunctionId={parentFunctionId}
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
				/>
			);
		default:
			metadataType satisfies never;
			console.error("Unsupported data type");
			return null;
	}
}

type SelectInputProps = {
	metadata: SelectMetadata;
	functionId: number | undefined;
	parentFunctionId: number;
};

function SelectInput({
	metadata,
	functionId,
	parentFunctionId,
}: SelectInputProps) {
	const currentMetadata = useMetadata(functionId);
	const parentMetadata = useMetadata(parentFunctionId);

	const currentMetadataValue = currentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	const [currentMetadataValues, setCurrentMetadataValues] = useState(
		currentMetadata.data
			?.filter((m) => metadata.key === m.key)
			?.map((m) => ({ value: m.key, label: m.value })),
	);

	const parentMetadataValue = parentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	const options = useQuery({
		queryKey: [metadata],
		queryFn: metadata.getOptions,
	});

	return (
		<FormControl isRequired={metadata.isRequired}>
			<FormLabel
				style={{
					fontSize: "small",
					fontWeight: "medium",
				}}
			>
				{metadata.label}
			</FormLabel>
			<Skeleton isLoaded={!options.isLoading} fitContent>
				{options.isSuccess ? (
					metadata.selectMode === "single" ? (
						<SingleSelect
							options={options}
							metadata={metadata}
							currentMetadataValue={currentMetadataValue}
							parentMetadataValue={parentMetadataValue}
						/>
						// <Select
						// 	name={metadata.key}
						// 	size="sm"
						// 	borderRadius="5px"
						// 	placeholder={currentMetadataValue ?? metadata.placeholder}
						// 	defaultValue={
						// 		currentMetadataValue ??
						// 		(metadata.inheritFromParent ? parentMetadataValue : undefined)
						// 	}
						// >
						// 	{options.data?.map((option) => (
						// 		<option key={option.value} value={option.value}>
						// 			{option.name}
						// 		</option>
						// 	))}
						// </Select>
					) : (
						<SearchAsync
							id={metadata.key}
							size="sm"
							value={currentMetadataValues ?? undefined}
							isMulti
							debounceTime={100}
							defaultOptions
							dropdownIndicator={<Icon icon="expand_more" weight={400} />}
							loadOptions={(inputValue, callback) => {
								const filteredOptions = options.data
									?.filter((option) =>
										option.name
											.toLowerCase()
											.includes(inputValue.toLowerCase()),
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
							}}
							placeholder="Søk"
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
};

function SingleSelect({
	metadata,
	options,
	currentMetadataValue,
	parentMetadataValue,
}: SingleSelectProps) {
	return (
		<Select
			name={metadata.key}
			size="sm"
			borderRadius="5px"
			placeholder={currentMetadataValue ?? metadata.placeholder}
			defaultValue={
				currentMetadataValue ??
				(metadata.inheritFromParent ? parentMetadataValue : undefined)
			}
		>
			{options.data?.map((option) => (
				<option key={option.value} value={option.value}>
					{option.name}
				</option>
			))}
		</Select>
	);
}

type InputProps = {
	metadata: InputMetadata;
	functionId: number | undefined;
	parentFunctionId: number;
};

function InputField({ metadata, functionId, parentFunctionId }: InputProps) {
	const currentMetadata = useMetadata(functionId);
	const parentMetadata = useMetadata(parentFunctionId);

	const currentMetadataValue = currentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	const parentMetadataValue = parentMetadata.data?.find(
		(m) => metadata.key === m.key,
	)?.value;

	return (
		<FormControl isRequired={metadata.isRequired}>
			<FormLabel style={{ fontSize: "small", fontWeight: "medium" }}>
				{metadata.label}
			</FormLabel>
			<Input
				autoFocus
				type={metadata.type}
				name={metadata.key}
				defaultValue={
					currentMetadataValue ??
					(metadata.inheritFromParent ? parentMetadataValue : undefined)
				}
				placeholder={metadata.placeholder}
				size="sm"
				borderRadius="5px"
			/>
		</FormControl>
	);
}
