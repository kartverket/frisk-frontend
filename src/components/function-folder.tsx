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
	Text,
} from "@kvib/react";
import { Link as TSRLink } from "@tanstack/react-router";

type FunctionFolderProps = {
	functionId: number;
};

export function FunctionFolder({ functionId }: FunctionFolderProps) {
	const { path } = Route.useSearch();
	const { func, children, addFunction } = useFunction(functionId, {
		includeChildren: true,
	});

	const navigate = Route.useNavigate();

	const selectedFunctionIds = getIdsFromPath(path);

	return (
		<Flex p={2} gap={2} flexDirection="column">
			<Skeleton isLoaded={!!func.data} fitContent>
				<Heading>{func.data?.name}</Heading>
			</Skeleton>
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
				<List>
					{children.data?.map((child) => (
						<ListItem key={child.id + child.name + child.parentId + child.path}>
							<TSRLink to={Route.to} search={{ path: child.path }}>
								<Text
									as="span"
									display="flex"
									w="100%"
									textAlign="start"
									p={2}
									bgColor={
										selectedFunctionIds.includes(child.id)
											? "green.100"
											: undefined
									}
								>
									{child.name}
								</Text>
							</TSRLink>
						</ListItem>
					))}
				</List>
			</Skeleton>
		</Flex>
	);
}
