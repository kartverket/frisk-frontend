import { Header as KvibHeader } from "@kvib/react";

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
		<div className="bg-red-50 text-red-900 text-sm font-medium px-4 py-2 rounded-md flex items-center flex-col">
			<p>
				Denne siden er under utvikling. Vi er ikke helt sikre på at alt funker
				som det skal.
			</p>
			<p>Alt innhold blir liggende offentlig tilgjengelig.</p>
			<p>Vær forsiktig med å legge inn sensitiv/hemmelig informasjon.</p>
		</div>
	);
}
