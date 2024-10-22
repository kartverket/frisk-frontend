import { useFunction } from "@/hooks/use-function";
import { getIdFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import { useEffect } from "react";

export function CreateAndRedirectEffect() {
	const navigate = Route.useNavigate();
	const { path, newMetadataKey, newMetadataValue, redirect } =
		Route.useSearch();
	const { func, addMetadata } = useFunction(getIdFromPath(path) ?? 1);

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
						navigate({ search: { path: func.data.path } });
					}
				});
		}
	}, [
		redirect,
		newMetadataKey,
		newMetadataValue,
		func.data,
		addMetadata,
		navigate,
	]);

	return null;
}
