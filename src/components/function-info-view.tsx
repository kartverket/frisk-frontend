import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Link as TSRLink } from "@tanstack/react-router";
import { Skeleton, Link as KvibLink, List, ListItem } from "@kvib/react";

type FunctionInfoViewProps = {
	functionId: number;
};

export function FunctionInfoView({ functionId }: FunctionInfoViewProps) {
	const { func, dependencies, dependents } = useFunction(functionId, {
		includeDependencies: true,
		includeDependents: true,
	});

	return (
		<Skeleton isLoaded={!!func.data} fitContent>
			<div className="p-2">
				<p>Funksjonsnavn: {func.data?.name}</p>
				<p>Beskrivelse: {func.data?.description}</p>

				<p className="font-bold">Avhengig av</p>
				<List>
					{dependencies.data?.map((dependency) => (
						<ListItem key={dependency.id}>
							<KvibLink>
								<TSRLink to={Route.to} search={{ path: dependency.path }}>
									{dependency.name}
								</TSRLink>
							</KvibLink>
						</ListItem>
					))}
				</List>

				<p className="font-bold">Brukes av</p>
				<List>
					{dependents.data?.map((dependent) => (
						<ListItem key={dependent.id}>
							<KvibLink>
								<TSRLink to={Route.to} search={{ path: dependent.path }}>
									{dependent.name}
								</TSRLink>
							</KvibLink>
						</ListItem>
					))}
				</List>
			</div>
		</Skeleton>
	);
}
