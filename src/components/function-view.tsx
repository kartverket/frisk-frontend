import { Route } from "@/routes";
import { FunctionEditView } from "./function-edit-view";
import { FunctionInfoView } from "./function-info-view";
import { Button } from "@kvib/react";
import { useFunction } from "@/hooks/use-function";
import { useCallback } from "react";
import type { BackendFunction } from "@/services/backend";
import { getIdsFromPath } from "@/lib/utils";

type FunctionViewProps = {
	functionId: number;
};

export function FunctionView({ functionId }: FunctionViewProps) {
	const { edit, path } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { func, removeChild } = useFunction(functionId, {
		includeChildren: true,
	});
	const selectedFunctionIds = getIdsFromPath(path);

	function onEditComplete() {
		navigate({
			search: {
				path,
				edit: false,
			},
		});
	}

	const handleDeletedFunction = useCallback(
		(deletedFunction: BackendFunction) => {
			if (selectedFunctionIds.includes(deletedFunction.id)) {
				const deletedFunctionParentPath = deletedFunction.path
					.split(".")
					.slice(0, -1)
					.join(".");
				navigate({
					search: {
						path: deletedFunctionParentPath ?? "1",
					},
				});
				return;
			}
		},
		[selectedFunctionIds, navigate],
	);

	return (
		<div className="p-2 flex flex-col gap-2">
			{edit ? (
				<FunctionEditView
					functionId={functionId}
					onEditComplete={onEditComplete}
				/>
			) : (
				<FunctionInfoView functionId={functionId} />
			)}
			<div className="flex gap-2">
				<Button
					colorScheme="blue"
					disabled={true /* Disabled until backend is ready */}
					onClick={() => navigate({ search: { path, edit: !edit } })}
				>
					{edit ? "Vis" : "Rediger"}
				</Button>
				<Button
					colorScheme="red"
					disabled={!func.data}
					onClick={() => {
						if (!func.data) return;
						removeChild.mutate(func.data.id);
						handleDeletedFunction(func.data);
					}}
				>
					Slett
				</Button>
			</div>
		</div>
	);
}
