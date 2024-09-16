import { useFunction } from "@/hooks/use-function";
import { cn, getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { Button, Input, Skeleton } from "@kvib/react";
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
		<div className="p-2 flex flex-col gap-2">
			<h2 className="text-xl font-bold">
				{func.data?.name ?? (
					<div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm" />
				)}
			</h2>
			<form
				className="flex gap-2"
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
				<Input type="text" name="name" placeholder="Navn" required />
				<Button type="submit">Legg til</Button>
			</form>
			<ul className="flex flex-col overflow-scroll">
				<Skeleton isLoaded={!!children.data} h={60}>
					{children.data?.map((child) => (
						<li
							key={child.id + child.name + child.parentId + child.path}
							className="bg-transparent w-full"
						>
							<TSRLink
								className={cn(
									"flex w-full p-2 text-start data-[status=active]:bg-green-200",
									selectedFunctionIds.includes(child.id) ? "bg-green-200" : "",
								)}
								to={Route.to}
								search={{ path: child.path }}
							>
								{child.name}
							</TSRLink>
						</li>
					))}
				</Skeleton>
			</ul>
		</div>
	);
}
