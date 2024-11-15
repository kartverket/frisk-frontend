import { useFunction } from "@/hooks/use-function";
import { Button, Flex, Input, Text } from "@kvib/react";
import { TeamSelect } from "./team-select";

type AddFunctionFormProps = {
	functionId: number;
	setSelectedForm: React.Dispatch<React.SetStateAction<number | null>>;
};

export function AddFunctionForm({
	functionId,
	setSelectedForm,
}: AddFunctionFormProps) {
	const { addFunction } = useFunction(functionId);
	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				const form = e.target as HTMLFormElement;
				const nameElement = form.elements.namedItem(
					"name",
				) as HTMLInputElement | null;
				const teamElement = form.elements.namedItem(
					"team-value",
				) as HTMLInputElement;
				if (!nameElement || !teamElement) return;

				addFunction.mutateAsync({
					function: {
						name: nameElement.value,
						description: null,
						parentId: functionId,
					},
					metadata: [
						{
							key: "team",
							value: teamElement.value,
						},
					],
				});
				// clear form
				form.reset();
				setSelectedForm(null);
			}}
		>
			<Flex
				border="1px"
				borderRadius="8px"
				borderColor="blue.500"
				pt="14px"
				px="25px"
				pb="30px"
				flexDirection="column"
			>
				<Text fontSize="xs" fontWeight="700" mb="4px">
					Funksjonsnavn*
				</Text>
				<Input
					type="text"
					name="name"
					placeholder="Navn"
					required
					size="sm"
					borderRadius="5px"
					mb="20px"
					autoFocus
				/>
				<TeamSelect functionId={functionId} />
				<Flex gap="10px">
					<Button
						aria-label="delete"
						variant="secondary"
						colorScheme="blue"
						size="sm"
						onClick={() => setSelectedForm(null)}
					>
						Avbryt
					</Button>
					<Button type="submit" aria-label="check" colorScheme="blue" size="sm">
						Lagre
					</Button>
				</Flex>
			</Flex>
		</form>
	);
}
