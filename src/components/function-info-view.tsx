import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Link as TSRLink } from "@tanstack/react-router";
import {
	Skeleton,
	Link as KvibLink,
	List,
	ListItem,
	Box,
	Text,
} from "@kvib/react";

type FunctionInfoViewProps = {
	functionId: number;
};

export function FunctionInfoView({ functionId }: FunctionInfoViewProps) {
	const { func, dependencies, dependents, metadata } = useFunction(functionId, {
		includeDependencies: true,
		includeDependents: true,
		includeMetadata: true,
	});

	return (
		<Skeleton isLoaded={!!func.data} fitContent>
			<Box p={2}>
				<Text>Funksjonsnavn: {func.data?.name}</Text>
				<Text>Beskrivelse: {func.data?.description}</Text>

				<Text>Avhengigheter</Text>
				<List>
					{dependencies.data?.map((dependency) => (
						<ListItem key={dependency.id}>
							<TSRLink to={Route.to} search={{ path: dependency.path }}>
								<KvibLink as="span">{dependency.name}</KvibLink>
							</TSRLink>
						</ListItem>
					))}
				</List>

				<Text>Brukes av</Text>
				<List>
					{dependents.data?.map((dependent) => (
						<ListItem key={dependent.id}>
							<TSRLink to={Route.to} search={{ path: dependent.path }}>
								<KvibLink as="span">{dependent.name}</KvibLink>
							</TSRLink>
						</ListItem>
					))}
				</List>

				<Text>Metadata</Text>
				<List>
					{metadata.data?.map((metadata) => (
						<ListItem key={metadata.id}>
							<Text>
								{metadata.key}: {metadata.value}
							</Text>
						</ListItem>
					))}
				</List>
			</Box>
		</Skeleton>
	);
}
