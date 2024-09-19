import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@kvib/react";
import { Link as TSRLink } from "@tanstack/react-router";

type BreadcrumbsProps = {
	path: string;
};

export function Breadcrumbs({ path }: BreadcrumbsProps) {
	const ids = path.split(".").map((id) => Number.parseInt(id));

	return (
		<Breadcrumb p={4}>
			{ids?.map((id) => (
				<BreadcrumbItem key={id}>
					<CustomBreadcrumbLink key={id} functionId={id} />
				</BreadcrumbItem>
			))}
		</Breadcrumb>
	);
}

type BreadcrumbItemProps = {
	functionId: number;
};
function CustomBreadcrumbLink({ functionId }: BreadcrumbItemProps) {
	const { func } = useFunction(functionId);
	const { path } = Route.useSearch();

	return (
		<TSRLink to={Route.to} search={{ path: func.data?.path }}>
			<BreadcrumbLink as="span" isCurrentPage={path === func.data?.path}>
				{func.data?.name}
			</BreadcrumbLink>
		</TSRLink>
	);
}
