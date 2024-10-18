import { useMsal } from "@azure/msal-react";
import { Button, Flex, Header as KvibHeader, Text } from "@kvib/react";

export function Header() {
	const msal = useMsal();
	const accounts = msal.accounts;
	const account = accounts[0];

	return (
		<header>
			{(import.meta.env.VITE_BACKEND_URL as string).includes("fly.dev") && (
				<WarningBanner />
			)}
			<KvibHeader>
				<Button
					variant="tertiary"
					leftIcon="logout"
					onClick={() => {
						msal.instance.logout({
							account,
						});
					}}
				>
					<Text>Logg ut</Text>
				</Button>
			</KvibHeader>
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
			<Text>Innhold er ikke lagret hos Kartverket.</Text>
			<Text>Vær forsiktig med å legge inn sensitiv/hemmelig informasjon.</Text>
		</Flex>
	);
}
