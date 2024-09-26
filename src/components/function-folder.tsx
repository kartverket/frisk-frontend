import { useFunction } from "@/hooks/use-function";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	Button,
	Flex,
	Heading,
	Input,
	List,
	ListItem,
	Skeleton,
} from "@kvib/react";
import { FunctionFolderItem } from "./function-folder-item";

type FunctionFolderProps = {
	functionId: number;
};

export function FunctionFolder({ functionId }: FunctionFolderProps) {
	const { path } = Route.useSearch();
	const { children, addFunction } = useFunction(functionId, {
		includeChildren: true,
	});

	const navigate = Route.useNavigate();

	const selectedFunctionIds = getIdsFromPath(path);
	const currentLevel = selectedFunctionIds.indexOf(functionId);

	return (
		<Flex p={2} gap={2} flexDirection="column">
			<Heading>Funksjon nivå {currentLevel + 1}</Heading>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const form = e.target as HTMLFormElement;
					const nameElement = form.elements.namedItem(
						"name",
					) as HTMLInputElement | null;
					if (!nameElement) return;
					addFunction
						.mutateAsync({
							name: nameElement.value,
							description: null,
							parentId: functionId,
						})
						.then((f) => navigate({ search: { path: f.path } }));
					// clear form
					nameElement.value = "";
				}}
			>
				<Flex gap={2}>
					<Input type="text" name="name" placeholder="Navn" required />
					<Button type="submit">Legg til</Button>
				</Flex>
			</form>
			<Skeleton isLoaded={!!children.data} h={60}>
				<List display="flex" flexDirection="column" gap={2}>
					{children.data?.map((child) => (
						<ListItem key={child.id + child.name + child.parentId + child.path}>
							<FunctionFolderItem
								functionId={child.id}
								selected={selectedFunctionIds.includes(child.id)}
							/>
						</ListItem>
					))}
				</List>
			</Skeleton>
		</Flex>
	);
}
