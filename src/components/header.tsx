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
