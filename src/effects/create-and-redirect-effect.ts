import { useFunction } from "@/hooks/use-function";
import { useMetadata } from "@/hooks/use-metadata";

import { Route } from "@/routes";
import { useEffect } from "react";

export function CreateAndRedirectEffect() {
	const navigate = Route.useNavigate();
	const {
		path,
		flags,
		functionId,
		newMetadataKey,
		newMetadataValue,
		redirect,
	} = Route.useSearch();

	const { func } = useFunction(functionId ?? 1);
	const { addMetadata } = useMetadata(functionId ?? 1);

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
						navigate({ search: { path: path, flags: flags } });
					}
				});
		}
	}, [
		redirect,
		newMetadataKey,
		newMetadataValue,
		func.data,
		path,
		flags,
		addMetadata,
		navigate,
	]);

	return null;
}
