import { useFunction } from "@/hooks/use-function";
import { Button } from "@kvib/react";
import type { ButtonProps } from "@kvib/react";

export function SchemaButton({
	functionId,
	...rest
}: ButtonProps & { functionId: number }) {
	const { func, metadata } = useFunction(functionId);
	return (
		<Button
			variant="primary"
			colorScheme="blue"
			size="xs"
			width="fit-content"
			{...rest}
			onClick={() => {
				if (!func.data) return;
				const teamId = metadata.data?.find((obj) => obj.key === "team")?.value;

				const searchParamsRedirectURL = new URLSearchParams({
					path: `"${func.data.path}"`,
					newMetadataKey: "rr-{tableName}-{contextName}",
					newMetadataValue: "{contextId}",
					redirect: `"${location.origin}"`,
				});
				const redirectURL = `${location.origin}?${searchParamsRedirectURL.toString()}`;

				const searchParams = new URLSearchParams({
					name: func.data?.name,
					...(teamId && { teamId }),
					redirect: redirectURL,
					locked: "true",
					redirectBackUrl: window.location.href,
					redirectBackTitle: "Funksjonsregisteret",
				});
				const path = `${import.meta.env.VITE_REGELRETT_FRONTEND_URL}/ny?${searchParams.toString()}`;
				window.location.href = path;
			}}
		>
			Opprett sikkerhetsskjema
		</Button>
	);
}
