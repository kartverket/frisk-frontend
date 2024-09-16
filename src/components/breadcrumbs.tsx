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
		<Breadcrumb className="p-2">
			{ids?.map((id) => (
				<CustomBreadcrumbItem key={id} functionId={id} />
			))}
		</Breadcrumb>
	);
}

type BreadcrumbItemProps = {
	functionId: number;
};
function CustomBreadcrumbItem({ functionId }: BreadcrumbItemProps) {
	const { func } = useFunction(functionId);
	const { path } = Route.useSearch();

	return (
		<BreadcrumbItem>
			<TSRLink to={Route.to} search={{ path: func.data?.path }}>
				<BreadcrumbLink as="span" isCurrentPage={path === func.data?.path}>
					{func.data?.name}
				</BreadcrumbLink>
			</TSRLink>
		</BreadcrumbItem>
	);
}
