import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import {
	Button,
	HStack,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	Text,
} from "@kvib/react";

type Props = {
	onOpen: () => void;
	onClose: () => void;
	isOpen: boolean;
	functionId: number;
};

export function DeleteFunctionModal({ onClose, isOpen, functionId }: Props) {
	const { func, removeFunction } = useFunction(functionId);
	const navigate = Route.useNavigate();

	return (
		<Modal onClose={onClose} isOpen={isOpen} isCentered>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Slett funksjon</ModalHeader>
				<ModalBody>
					<Stack>
						<Text size="sm">Er du sikker på at du vil slette funksjonen?</Text>
					</Stack>
				</ModalBody>
				<ModalFooter>
					<HStack justifyContent="end">
						<Button variant="tertiary" colorScheme="blue" onClick={onClose}>
							Avbryt
						</Button>
						<Button
							aria-label="Slett funksjon"
							variant="primary"
							colorScheme="red"
							leftIcon="delete"
							onClick={(e) => {
								e.preventDefault();
								if (!func.data) return;
								const deletedFunctionParentPath = func.data.path
									.split(".")
									.slice(0, -1)
									.join(".");

								removeFunction.mutate(func.data.id);
								navigate({
									search: {
										path: deletedFunctionParentPath ?? "1",
									},
								});
							}}
							isLoading={removeFunction.isPending}
						>
							Slett funksjon
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
