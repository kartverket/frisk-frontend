import { useFunction } from "../hooks/use-function"

type FunctionFolderProps = {
  functionId: number
  selectedFunctionId: number
  setSelectedFunctionId: (id?: number) => void
}

export function FunctionFolder({ functionId, selectedFunctionId, setSelectedFunctionId }: FunctionFolderProps) {
  const { children, addChild, removeChild } = useFunction(functionId, {
    ignoreThis: true,
  })

  return (
    <div className="p-2">
      <form onSubmit={(e) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement;
        const nameElement = form.elements.namedItem('name') as HTMLInputElement | null;
        if (!nameElement) return;
        addChild.mutate({
          name: nameElement.value,
          parentId: functionId,
        })
        // clear form
        nameElement.value = ''
      }}>
        <input type="text" name="name" placeholder="Navn" required />
        <button type="submit">Legg til</button>
      </form>
      <ul className="flex flex-col">
        {children.isLoading && (
          <>
            <li className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></li>
            <li className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></li>
            <li className="w-24 h-6 bg-gray-400 animate-pulse rounded-sm"></li>
          </>
        )}
        {children.data?.map((child) => (
          <li key={child.id + child.name + child.parentId + child.path} className={`flex p-2 justify-between gap-2 ${child.id === selectedFunctionId ? 'bg-green-200' : ''}`}>
            <button className="disabled:opacity-50 w-full text-start" disabled={child.id < 0} onClick={() => setSelectedFunctionId(child.id)}>
              {child.name}
            </button>

            <button
              className='disabled:opacity-50 bg-red-500 text-white rounded-sm px-2 hover:bg-red-600'
              disabled={child.id < 0}
              onClick={() => {
                removeChild.mutate(child.id)
                if (child.id === selectedFunctionId) {
                  setSelectedFunctionId(undefined)
                }
              }}>
              Slett
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
