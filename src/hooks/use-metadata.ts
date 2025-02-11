import {
	createFunctionMetadata,
	deleteFunctionMetadata,
	type FunctionMetadata,
	getFunctionMetadata,
	patchMetadataValue,
} from "@/services/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getConfig } from "../../frisk.config";
import { useToast } from "@kvib/react";

export function useMetadata(functionId: number | undefined) {
	const queryClient = useQueryClient();
	const toast = useToast();
	const metadata = useQuery({
		queryKey: ["functions", functionId, "metadata"],
		queryFn: async () => {
			// biome-ignore lint/style/noNonNullAssertion: We know that functionId is not undefined here since the qury is disabled if it is
			const functionMetadata = await getFunctionMetadata(functionId!);
			return functionMetadata;
		},
		enabled: !!functionId,
	});

	const addMetadata = useMutation({
		mutationFn: createFunctionMetadata,
		onMutate: async (_newMetadata) => {
			if (!functionId) return;
			await queryClient.cancelQueries({
				queryKey: ["functions", _newMetadata.functionId, "metadata"],
			});

			const previousMetadata = queryClient.getQueryData<FunctionMetadata[]>([
				"functions",
				functionId,
				"metadata",
			]);

			const randomNegativeNumber = -Math.floor(Math.random() * 1000);
			const newMetadata: FunctionMetadata = {
				id: randomNegativeNumber,
				functionId,
				key: _newMetadata.key,
				value: _newMetadata.value,
			};

			if (previousMetadata) {
				queryClient.setQueryData<FunctionMetadata[]>(
					["functions", _newMetadata.functionId, "metadata"],
					[...previousMetadata, newMetadata],
				);
			} else {
				queryClient.setQueryData<FunctionMetadata[]>(
					["functions", _newMetadata.functionId, "metadata"],
					[newMetadata],
				);
			}

			return { previousMetadata };
		},
		onError: (_, vars, context) => {
			queryClient.setQueryData<FunctionMetadata[]>(
				["functions", vars.functionId, "metadata"],
				context?.previousMetadata,
			);
		},
		onSettled: (_, __, newMetadata) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", newMetadata.functionId, "metadata"],
			});
		},
	});

	const removeMetadata = useMutation({
		mutationFn: (args: { id: number; functionId: number }) =>
			deleteFunctionMetadata(args.id),
		onMutate: async (deletedMetadata) => {
			await queryClient.cancelQueries({
				queryKey: ["functions", deletedMetadata.functionId, "metadata"],
			});

			const previousMetadata = queryClient.getQueryData<FunctionMetadata[]>([
				"functions",
				deletedMetadata.functionId,
				"metadata",
			]);

			if (previousMetadata) {
				queryClient.setQueryData<FunctionMetadata[]>(
					["functions", deletedMetadata.functionId, "metadata"],
					previousMetadata.filter(
						(metadata) => metadata.id !== deletedMetadata.id,
					),
				);
			} else {
				queryClient.setQueryData<FunctionMetadata[]>(
					["functions", deletedMetadata.functionId, "metadata"],
					[],
				);
			}

			return { previousMetadata };
		},
		onError: (_, deletedMetadata, context) => {
			queryClient.setQueryData<FunctionMetadata[]>(
				["functions", deletedMetadata.functionId, "metadata"],
				context?.previousMetadata,
			);
		},
		onSettled: (_, __, deletedMetadata) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", deletedMetadata.functionId, "metadata"],
			});
		},
	});

	const updateMetadataValue = useMutation({
		mutationFn: async (
			input: Parameters<typeof patchMetadataValue>[0] & {
				key: string;
				functionId: number;
			},
		) => {
			const { key, functionId, ...validMetadata } = input;
			await patchMetadataValue(validMetadata);
			try {
				(await getConfig()).metadata
					?.find((m) => m.key === input.key)
					?.onChange?.(input);
			} catch (error) {
				console.error("Error updating metadata value:", error);
				const toastId = "update-metadata-value";
				if (!toast.isActive(toastId)) {
					toast({
						id: toastId,
						title: "Å nei!",
						description:
							"Noe gikk galt under endringen av metadata. Prøv gjerne igjen!",
						status: "error",
						duration: 5000,
						isClosable: true,
					});
				}
			}
		},
		onMutate: async (updatedMetadata) => {
			await queryClient.cancelQueries({
				queryKey: ["functions", functionId, "metadata"],
			});

			const previousMetadata = queryClient.getQueryData<FunctionMetadata[]>([
				"functions",
				functionId,
				"metadata",
			]);

			if (previousMetadata) {
				const updatedMetadataList = previousMetadata.map((metadata) =>
					metadata.id === updatedMetadata.id
						? { ...metadata, value: updatedMetadata.value }
						: metadata,
				);

				queryClient.setQueryData<FunctionMetadata[]>(
					["functions", functionId, "metadata"],
					updatedMetadataList,
				);
			}
			return { previousMetadata };
		},
		onError: (_, __, context) => {
			queryClient.setQueryData<FunctionMetadata[]>(
				["functions", functionId, "metadata"],
				context?.previousMetadata,
			);
		},
		onSettled: (_updatedMetadataValue) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", functionId, "metadata"],
			});
		},
	});

	return { metadata, addMetadata, removeMetadata, updateMetadataValue };
}
