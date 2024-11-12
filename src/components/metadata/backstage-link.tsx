import { Link } from "@kvib/react";

export function BackstageLink({
	url,
}: {
	url: string;
}) {
	return (
		<Link
			fontSize="xs"
			fontWeight="700"
			width="fit-content"
			isExternal
			href={url}
			onClick={(e) => e.stopPropagation()}
			marginBottom="10px"
		>
			Lenke Backstage
		</Link>
	);
}
