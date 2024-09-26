import { Route } from "@/routes";
import type { BackendFunction } from "@/services/backend";
import { Button, Card, Flex, Icon, IconButton, Text } from "@kvib/react";
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
				<Flex
					bgColor={selected ? "blue.50" : undefined}
					borderRadius="inherit"
					alignItems="center"
					p={2}
				>
					<Text
						fontWeight="bold"
						as="span"
						display="flex"
						w="100%"
						textAlign="start"
					>
						{backendFunction.name}
					</Text>
					<Flex>
						<IconButton
							colorScheme="gray"
							variant="ghost"
							aria-label="edit"
							icon="edit"
						/>
						<IconButton
							colorScheme="gray"
							variant="ghost"
							aria-label="drag"
							icon="drag_indicator"
						/>
						<IconButton
							colorScheme="gray"
							variant="ghost"
							aria-label={selected ? "close" : "open"}
							icon={selected ? "arrow_back_ios" : "arrow_forward_ios"}
						/>
					</Flex>
				</Flex>
			</TSRLink>
		</Card>
	);
}
