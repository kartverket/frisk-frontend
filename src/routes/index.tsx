import { createFileRoute } from "@tanstack/react-router";
import { FunctionColumnView } from "../components/function-column-view";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { number, object, string, array } from "zod";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import { useFunction } from "@/hooks/use-function";
import { useEffect } from "react";
import { Main } from "@/components/main";
import { CreateAndRedirectEffect } from "@/effects/create-and-redirect-effect";

const functionSearchSchema = object({
	path: fallback(
		array(
			string()
				.refine((arg) =>
					arg.split(".").every((part) => Number.parseInt(part) >= 0),
				)
				.default("1"),
		),
		["1"],
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
	// const idArray = path.split(".").map((part) => Number.parseInt(part));
	// const id = idArray.pop() ?? 1;

	const idArrays = path.map((pathArray) =>
		pathArray.split(".").map((part) => Number.parseInt(part)),
	);
	const ids = idArrays.map((pathArray) => pathArray.pop() ?? 1);
	const { functions } = useFunction(undefined, ids);

	useEffect(() => {
		functions?.map((func, i) => {
			// TODO: trenger man denne?

			if (func.error) {
				// if function id is invalid, navigate to parent until it is valid
				const updatedPathArray = idArrays.map((id, index) =>
					i === index ? idArrays[i].join(".") : path[i],
				);
				navigate({
					search: {
						path: updatedPathArray,
						edit: undefined,
					},
				});
			}
		});
	}, [functions, path, navigate, idArrays]);

	return (
		<Main>
			{/* <Breadcrumbs path={path} /> */}
			{/* <FunctionView functionId={id} /> */}
			<FunctionColumnView path={path} />
			<CreateAndRedirectEffect />
		</Main>
	);
}
