import { Box, Icon, Header as KvibHeader } from "@kvib/react";

export function Header() {
	return (
		<header>
			<KvibHeader
				justifyContent="space-between"
				showMenuButton={true}
				showChildrenInMenu={false}
			/>
		</header>
	);
}
