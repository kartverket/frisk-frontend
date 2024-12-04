import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { useEffect } from "react";

export function CreateAndRedirectEffect() {
	const navigate = Route.useNavigate();
	const { path, functionId, newMetadataKey, newMetadataValue, redirect } =
		Route.useSearch();

	const { func, addMetadata } = useFunction(functionId ?? 1);

	useEffect(() => {
		if (
			newMetadataKey &&
			newMetadataValue &&
			func.data &&
			!addMetadata.isPending
		) {
			addMetadata
				.mutateAsync({
					functionId: func.data.id,
					key: newMetadataKey,
					value: newMetadataValue,
				})
				.then(() => {
					if (redirect) {
						window.location.href = redirect;
					} else {
						navigate({ search: { path: path } });
					}
				});
		}
	}, [
		redirect,
		newMetadataKey,
		newMetadataValue,
		func.data,
		path,
		addMetadata,
		navigate,
	]);

	return null;
}
