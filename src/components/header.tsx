import { Flex, Header as KvibHeader, Text } from "@kvib/react";

export function Header() {
	return (
		<header>
			<WarningBanner />
			<KvibHeader />
		</header>
	);
}

function WarningBanner() {
	return (
		<Flex
			bgColor="red.50"
			textColor="red.500"
			p={2}
			alignItems="center"
			flexDirection="column"
		>
			<Text>
				Denne siden er under utvikling. Vi er ikke helt sikre på at alt funker
				som det skal.
			</Text>
			<Text>Alt innhold blir liggende offentlig tilgjengelig.</Text>
			<Text>Vær forsiktig med å legge inn sensitiv/hemmelig informasjon.</Text>
		</Flex>
	);
}
