import { Route } from "@/routes";
import type { BackendFunction } from "@/services/backend";
import { Card, Text } from "@kvib/react";
import { Link as TSRLink } from "@tanstack/react-router";

export function FunctionFolderItem({
	backendFunction,
	selected,
}: { backendFunction: BackendFunction; selected: boolean }) {
	return (
		<Card borderColor="blue.500" borderWidth={1}>
			<TSRLink
				to={Route.to}
				search={{ path: backendFunction.path }}
				style={{ borderRadius: "inherit" }}
			>
				<Text
					fontWeight="bold"
					borderRadius="inherit"
					as="span"
					display="flex"
					w="100%"
					textAlign="start"
					p={2}
					bgColor={selected ? "blue.50" : undefined}
				>
					{backendFunction.name}
				</Text>
			</TSRLink>
		</Card>
	);
}
