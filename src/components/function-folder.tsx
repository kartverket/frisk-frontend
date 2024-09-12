import { useFunction } from "@/hooks/use-function"
import { BackendFunction } from "@/services/backend"
import { Link } from "@tanstack/react-router"
import { Route } from "@/routes"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type FunctionFolderProps = {
  functionId: number
  selectedFunctionIds: number[]
}

export function FunctionFolder({ functionId, selectedFunctionIds }: FunctionFolderProps) {
  const { func, children, addChild, removeChild } = useFunction(functionId, {
    includeChildren: true
  });

  const navigate = Route.useNavigate();


  const handleDeletedFunction = useCallback((deletedFunction: BackendFunction) => {
    if (selectedFunctionIds.includes(deletedFunction.id)) {
      const deletedFunctionParentPath = deletedFunction.path.split('.').slice(0, -1).join('.');
      navigate({
        search: {
          path: deletedFunctionParentPath ?? "1",
        },
      })
      return;
    }
  }, [selectedFunctionIds, navigate]);

  return (
    <div className="p-2">
      <h2 className="text-xl font-bold">
        {func.data?.name ?? <div className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></div>}
      </h2>
      <form
        className="flex"
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.target as HTMLFormElement;
          const nameElement = form.elements.namedItem('name') as HTMLInputElement | null;
          if (!nameElement) return;
          addChild.mutateAsync({
            name: nameElement.value,
            description: null,
            parentId: functionId,
          }).then((f) => navigate({ search: { path: f.path } }))
          // clear form
          nameElement.value = ''
        }}
      >
        <Input type="text" name="name" placeholder="Navn" required />
        <Button variant="default" type="submit">Legg til</Button>
      </form>
      <ul className="flex flex-col">
        {children.isLoading && (
          <>
            <li className="w-24 h-6 p-2 bg-gray-400 animate-pulse rounded-sm"></li>
            <li className="w-24 h-6 p-2 bg-gray-400 animate-pulse rounded-sm"></li>
            <li className="w-24 h-6 p-2 bg-gray-400 animate-pulse rounded-sm"></li>
          </>
        )}
        {children.data?.map((child) => (
          <li key={child.id + child.name + child.parentId + child.path} className={cn(`flex p-2 justify-between gap-2`, selectedFunctionIds.includes(child.id) ? 'bg-green-200' : '')}>
            <Link className="w-full text-start" to={Route.to} search={{ path: child.path, edit: false }}>
              {child.name}
            </Link>

            <Button
              variant="destructive"
              disabled={child.id < 0}
              onClick={() => {
                removeChild.mutate(child.id)
                handleDeletedFunction(child)
              }}>
              Slett
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
