import { useQueryClient } from "@tanstack/react-query";
import { useFunction } from "@/hooks/use-function";
import { BackendFunction } from "@/services/backend";

type FunctionEditViewProps = {
  functionId: number;
  onEditComplete?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FunctionEditView({ functionId, onEditComplete }: FunctionEditViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const queryClient = useQueryClient();
  const { func } = useFunction(functionId);

  return (
    <form className="flex flex-col gap-2" onSubmit={async (e) => {
      e.preventDefault()
      if (!func.data) return;
      const form = e.target as HTMLFormElement;
      const nameElement = form.elements.namedItem('name') as HTMLInputElement | null;
      const descriptionElement = form.elements.namedItem('description') as HTMLTextAreaElement | null;

      const nameValue = nameElement?.value === '' ? undefined : nameElement?.value;
      const descriptionValue = descriptionElement?.value === '' ? undefined : descriptionElement?.value;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const putObject: BackendFunction = {
        ...func.data,
        ...(nameValue && { name: nameValue }),
        ...(descriptionValue && { description: descriptionValue }),
      };

      /*       await putFunction(putObject).then(() => {
              queryClient.invalidateQueries({
                queryKey: ['functions', functionId],
              });
              onEditComplete?.();
            }) */
    }}>
      <input type="text" name="name" placeholder="Navn" required defaultValue={func.data?.name} />
      <textarea name="description" placeholder="Beskrivelse" defaultValue={func.data?.description ?? ""} />
      <button type="submit">Lagre</button>
    </form>
  )
}
