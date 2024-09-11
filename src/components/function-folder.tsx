import { useFunction } from "../hooks/use-function"
import { BackendFunction } from "../services/backend"
import { Link } from "@tanstack/react-router"
import { Route } from "../routes"
import { useCallback } from "react"

type FunctionFolderProps = {
  functionId: number
  selectedFunctionIds: number[]
}

export function FunctionFolder({ functionId, selectedFunctionIds }: FunctionFolderProps) {
  const { func, children, addChild, removeChild } = useFunction(functionId);

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
            parentId: functionId,
          }).then((f) => navigate({ search: { path: f.path } }))
          // clear form
          nameElement.value = ''
        }}
      >
        <input type="text" name="name" placeholder="Navn" required />
        <button className="whitespace-nowrap" type="submit">Legg til</button>
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
          <li key={child.id + child.name + child.parentId + child.path} className={`flex p-2 justify-between gap-2 ${selectedFunctionIds.includes(child.id) ? 'bg-green-200' : ''}`}>
            <Link className="w-full text-start" to={Route.to} search={{ path: child.path }}>
              {child.name}
            </Link>

            <button
              className='disabled:opacity-50 bg-red-500 text-white rounded-sm px-2 hover:bg-red-600'
              disabled={child.id < 0}
              onClick={() => {
                removeChild.mutate(child.id)
                handleDeletedFunction(child)
              }}>
              Slett
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
