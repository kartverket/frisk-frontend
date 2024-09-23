import { Route } from "@/routes";
import { FunctionEditView } from "./function-edit-view";
import { FunctionInfoView } from "./function-info-view";
import { Button, Flex } from "@kvib/react";

type FunctionViewProps = {
	functionId: number;
};

export function FunctionView({ functionId }: FunctionViewProps) {
	const { edit, path } = Route.useSearch();
	const navigate = Route.useNavigate();

	function onEditComplete() {
		navigate({
			search: {
				path,
				edit: false,
			},
		});
	}

	return (
		<Flex p={2} gap={2} flexDirection="column">
			{edit ? (
				<FunctionEditView
					functionId={functionId}
					onEditComplete={onEditComplete}
				/>
			) : (
				<FunctionInfoView functionId={functionId} />
			)}
			{!edit && (
				<Button
					colorScheme="blue"
					onClick={() => navigate({ search: { path, edit: !edit } })}
				>
					Rediger
				</Button>
			)}
		</Flex>
	);
}
