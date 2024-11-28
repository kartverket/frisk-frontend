import { createFileRoute } from "@tanstack/react-router";
import { FunctionColumnView } from "../components/function-column-view";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { number, object, string } from "zod";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import { useFunction } from "@/hooks/use-function";
import { useEffect } from "react";
import { Main } from "@/components/main";
import { CreateAndRedirectEffect } from "@/effects/create-and-redirect-effect";

const functionSearchSchema = object({
	path: fallback(
		string()
			.refine((arg) =>
				arg.split(".").every((part) => Number.parseInt(part) >= 0),
			)
			.default("1"),
		"1",
	),
	edit: number().optional(),
	newMetadataKey: string().optional(),
	newMetadataValue: string().optional(),
	redirect: string().optional(),
});

export const Route = createFileRoute("/")({
	component: Index,
	validateSearch: zodSearchValidator(functionSearchSchema),
});

function Index() {
	const { path } = Route.useSearch();
	const navigate = Route.useNavigate();
	const idArray = path.split(".").map((part) => Number.parseInt(part));
	const id = idArray.pop() ?? 1;

	const { func } = useFunction(id);

	useEffect(() => {
		if (func.error) {
			// if function id is invalid, navigate to parent until it is valid
			const parentPath = idArray.slice().join(".");
			navigate({
				search: {
					path: parentPath,
					edit: undefined,
				},
			});
		}
	}, [func.error, navigate, idArray]);

	return (
		<Main>
			<Breadcrumbs path={path} />
			<FunctionColumnView path={path} />
			<CreateAndRedirectEffect />
		</Main>
	);
}
