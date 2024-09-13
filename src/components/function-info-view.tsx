import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Link as TSRLink } from "@tanstack/react-router";
import { Skeleton, Link as KvibLink } from "@kvib/react";

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
				<p className="font-bold">Bruker</p>
				{dependencies.data?.map((dependency) => (
					<div key={dependency.id}>
						<KvibLink>
							<TSRLink to={Route.to} search={{ path: dependency.path }}>
								{dependency.name}
							</TSRLink>
						</KvibLink>
					</div>
				))}
				<p className="font-bold">Brukes av</p>
				{dependents.data?.map((dependent) => (
					<div key={dependent.id}>
						<KvibLink>
							<TSRLink to={Route.to} search={{ path: dependent.path }}>
								{dependent.name}
							</TSRLink>
						</KvibLink>
					</div>
				))}
			</div>
		</Skeleton>
	);
}
