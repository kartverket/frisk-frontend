import { useFunction } from "@/hooks/use-function";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	Box,
	Button,
	Flex,
	IconButton,
	Input,
	List,
	ListItem,
	Skeleton,
	Text,
} from "@kvib/react";
import { FunctionCard } from "./function-card";
import { useState } from "react";

type FunctionFolderProps = {
	functionId: number;
};

export function FunctionColumn({ functionId }: FunctionFolderProps) {
	const { path } = Route.useSearch();
	const { children, addFunction } = useFunction(functionId, {
		includeChildren: true,
	});

	const navigate = Route.useNavigate();

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.indexOf(functionId);

	const [isFormVisible, setFormVisible] = useState(false);

	return (
		<Flex flexDirection="column" width="380px">
			<Box
				bgColor="gray.200"
				border="1px"
				height="46px"
				alignContent="center"
				textAlign="center"
				borderColor="gray.400"
				minH="46px"
			>
				<Text size="lg" fontWeight="700">
					Funksjon nivå {currentLevel + 1}
				</Text>
			</Box>
			<Box border="1px" p="20px" borderColor="gray.400" minH="100%">
				<Skeleton isLoaded={!!children.data} minH={60}>
					<List display="flex" flexDirection="column" gap={2} marginBottom="2">
						{children.data?.map((child) => (
							<ListItem
								key={child.id + child.name + child.parentId + child.path}
							>
								<FunctionCard
									functionId={child.id}
									selected={selectedFunctionIds.includes(child.id)}
								/>
							</ListItem>
						))}
					</List>
					{isFormVisible && (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								const form = e.target as HTMLFormElement;
								const nameElement = form.elements.namedItem(
									"name",
								) as HTMLInputElement | null;
								if (!nameElement) return;
								addFunction.mutateAsync({
									name: nameElement.value,
									description: null,
									parentId: functionId,
								});
								// clear form
								nameElement.value = "";
								setFormVisible(false);
							}}
						>
							<Flex
								border="1px"
								borderRadius="8px"
								borderColor="gray.400"
								p="5px"
							>
								<Input type="text" name="name" placeholder="Navn" required />
								<IconButton
									type="submit"
									icon="check"
									aria-label="check"
									variant="tertiary"
									colorScheme="gray"
								/>
								<IconButton
									icon="delete"
									aria-label="delete"
									variant="tertiary"
									colorScheme="gray"
									onClick={() => setFormVisible(false)}
								/>
							</Flex>
						</form>
					)}
					<Button
						leftIcon="add"
						variant="tertiary"
						colorScheme="blue"
						onClick={() => setFormVisible(true)}
					>
						Legg til funksjon
					</Button>
				</Skeleton>
			</Box>
		</Flex>
	);
}
