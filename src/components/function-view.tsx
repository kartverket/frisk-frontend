import { Route } from "../routes";
import { FunctionEditView } from "./function-edit-view";
import { FunctionInfoView } from "./function-info-view";
import { Link } from "@tanstack/react-router";

type FunctionViewProps = {
  functionId: number
}

export function FunctionView({ functionId }: FunctionViewProps) {
  const { edit, path } = Route.useSearch();
  const navigate = Route.useNavigate();

  function onEditComplete() {
    navigate({
      search: {
        path,
        edit: false,
      },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Link disabled={true /* Disabled until backend is ready */} to={Route.to} search={(prev) => ({ ...prev, edit: !edit })}>{edit ? "Vis" : "Rediger"}</Link>
      {edit ? <FunctionEditView functionId={functionId} onEditComplete={onEditComplete} /> : <FunctionInfoView functionId={functionId} />}
    </div>
  )
}
