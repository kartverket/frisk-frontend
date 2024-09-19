import { Flex } from "@kvib/react";

export function Main({ children }: { children: React.ReactNode }) {
	return (
		<Flex as="main" h="100%" w="100%" flexDirection="column">
			{children}
		</Flex>
	);
}
