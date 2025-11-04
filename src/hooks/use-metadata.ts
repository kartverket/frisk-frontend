import {
	createFunctionMetadata,
	deleteFunctionMetadata,
	type FunctionMetadata,
	getFunctionMetadata,
	getMetadata,
	getMetadataAccess,
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

	const metadataByKeyAndValue = (key: string, value: string) =>
		useQuery({
			queryKey: ["key/value", key, value, "metadata"],
			queryFn: async () => {
				// biome-ignore lint/style/noNonNullAssertion: We know that functionId is not undefined here since the qury is disabled if it is
				const metadata = await getMetadata(key!, value!);
				return metadata;
			},
		});

	const access = useQuery({
		queryKey: ["functions", functionId, "metadata-access"],
		queryFn: async () => {
			// biome-ignore lint/style/noNonNullAssertion: We know that functionId is not undefined here since the qury is disabled if it is
			const accessData = await getMetadataAccess(functionId!);
			return accessData;
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

			const toastId = "add-metadata";
			if (!toast.isActive(toastId)) {
				toast({
					id: toastId,
					title: "Å nei!",
					description:
						"Noe gikk galt under lagring av metadata. Prøv gjerne igjen!",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			}
		},
		onSettled: (_, __, newMetadata) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", newMetadata.functionId, "metadata"],
			});
			queryClient.invalidateQueries({
				queryKey: ["indicators", newMetadata.key],
			});
		},
	});

	const removeMetadata = useMutation({
		mutationFn: async (args: {
			id: number;
			functionId: number;
			key: string;
			displayValue?: string;
		}) => {
			const toastId = "delete-metadata";
			try {
				(await getConfig()).metadata
					?.find((m) => m.key === args.key)
					?.onDelete?.({ id: args.id, functionId: args.functionId });
				await deleteFunctionMetadata(args.id);
				if (!toast.isActive(toastId)) {
					toast({
						id: toastId,
						description: args.displayValue
							? `Slettet ${args.displayValue}.`
							: "Slettet metadata.",
						status: "success",
						duration: 5000,
						isClosable: true,
					});
				}
			} catch (error) {
				console.error("Error deleting metadata: ", error);
				if (!toast.isActive(toastId)) {
					toast({
						id: toastId,
						title: "Å nei!",
						description:
							"Noe gikk galt under sletting av metadata. Prøv gjerne igjen!",
						status: "error",
						duration: 5000,
						isClosable: true,
					});
				}
			}
		},
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
			queryClient.invalidateQueries({
				queryKey: ["indicators", deletedMetadata.key],
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
		onSettled: (_, __, updatedMetadata) => {
			queryClient.invalidateQueries({
				queryKey: ["functions", functionId, "metadata"],
			});
			queryClient.invalidateQueries({
				queryKey: ["indicators", updatedMetadata.key],
			});
		},
	});

	return {
		metadata,
		metadataByKeyAndValue,
		metadataAccess: access.data,
		addMetadata,
		removeMetadata,
		updateMetadataValue,
	};
}
