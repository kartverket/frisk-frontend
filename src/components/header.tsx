import { Route } from "@/routes";
import { useMsal } from "@azure/msal-react";
import { Button, Flex, Icon, Text } from "@kvib/react";

export function Header() {
	const { config } = Route.useLoaderData();
	const msal = useMsal();
	const accounts = msal.accounts;
	const account = accounts[0];

	return (
		<header>
			<DeprecationBanner />
			<CustomHeader>
				<a href={config.logo.logoLink ?? "/"}>
					<img src={config.logo.imageSource} alt="logo" />
				</a>
				<Flex align="center" gap="8px">
					<Flex gap="4px">
						<Icon icon="account_circle" />
						<Text>{account.name}</Text>
					</Flex>
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
				</Flex>
			</CustomHeader>
		</header>
	);
}

function DeprecationBanner() {
	return (
		<div
			style={{
				backgroundColor: "#fff3cd",
				borderBottom: "2px solid #ffc107",
				padding: "10px 30px",
				display: "flex",
				alignItems: "center",
				gap: "10px",
			}}
		>
			<Icon icon="warning" style={{ color: "#856404" }} />
			<Text style={{ color: "#856404", margin: 0 }}>
				<strong>Viktig melding:</strong> Frisk er nå kun tilgjengelig i
				lesemodus og vil snart bli avviklet helt. Funksjonshierarkiet er flyttet
				Kartverket.dev som skal erstatte Frisk.
			</Text>
		</div>
	);
}

function CustomHeader({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				display: "flex",
				backgroundColor: "white",
				borderBottomWidth: "2px",
				borderBottomColor: "gray.200",
				padding: "30px",
				height: "90px",
				justifyContent: "space-between",
				alignItems: "center",
				gap: "90px",
			}}
		>
			{children}
		</div>
	);
}
