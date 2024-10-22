import { useMsal } from "@azure/msal-react";
import { Button, Header as KvibHeader, Text } from "@kvib/react";

export function Header() {
	const msal = useMsal();
	const accounts = msal.accounts;
	const account = accounts[0];

	return (
		<header>
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
