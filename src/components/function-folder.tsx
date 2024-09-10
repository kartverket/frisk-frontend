import { useFunction } from "../hooks/use-function"

type FunctionFolderProps = {
  functionId: number
  selectedFunctionId: number
  setSelectedFunctionId: (id: number) => void
}

export function FunctionFolder({ functionId, selectedFunctionId, setSelectedFunctionId }: FunctionFolderProps) {
  const { children, addChild, removeChild } = useFunction(functionId)

  return (
    <div className="p-2">
      <form onSubmit={(e) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement;
        const nameElement = form.elements.namedItem('name') as HTMLInputElement | null;
        if (!nameElement) return;
        addChild({
          name: nameElement.value,
          parentId: functionId,
        })
        // clear form
        nameElement.value = ''
      }}>
        <input type="text" name="name" required />
        <button type="submit">Legg til</button>
      </form>
      <ul>
        {children?.map((child) => (
          <li key={child.id + child.name + child.parentId + child.path} className="flex gap-2">
            {child.id === selectedFunctionId
              ? <p className="font-bold">{child.name}</p>
              : (
                <button onClick={() => setSelectedFunctionId(child.id)}>
                  {child.name}
                </button>
              )}

            <button className='disabled:opacity-50 text-red-500' disabled={child.id < 0} onClick={() => removeChild(child.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
