import { IconButton } from "@kvib/react";
import { Route } from "@/routes";
import { useFunction } from "@/hooks/use-function.tsx";

export function EditButton({ functionId }: { functionId: number }) {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { functionAccess } = useFunction(functionId, {
		includeChildren: true,
		includeAccess: true,
	});

	return (
		<IconButton
			isDisabled={!functionAccess}
			type="button"
			colorScheme="gray"
			variant="ghost"
			aria-label="edit"
			icon="edit"
			style={{ pointerEvents: "auto" }}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				navigate({ search: { ...search, edit: functionId } });
			}}
		/>
	);
}
