import { useMetadata } from "@/hooks/use-metadata";
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
	metadataId: number;
	displayValue: string | undefined;
};

export function DeleteMetadataModal({
	onClose,
	isOpen,
	functionId,
	metadataId,
	displayValue,
}: Props) {
	const { removeMetadata } = useMetadata(functionId);

	return (
		<Modal onClose={onClose} isOpen={isOpen} isCentered>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Slett {displayValue}</ModalHeader>
				<ModalBody>
					<Stack>
						<Text size="sm">
							Er du sikker på at du vil slette {displayValue}?
						</Text>
					</Stack>
				</ModalBody>
				<ModalFooter>
					<HStack justifyContent="end">
						<Button variant="tertiary" colorScheme="blue" onClick={onClose}>
							Avbryt
						</Button>
						<Button
							aria-label="Slett metadata"
							variant="primary"
							colorScheme="red"
							leftIcon="delete"
							onClick={async (e) => {
								e.stopPropagation();
								removeMetadata.mutateAsync({
									id: metadataId,
									functionId: functionId,
								});
							}}
							isLoading={removeMetadata.isPending}
						>
							Slett
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
