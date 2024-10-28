import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import {
	Card,
	Flex,
	Icon,
	IconButton,
	Input,
	Text,
	useDisclosure,
} from "@kvib/react";
import { Link as TSRLink } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { DeleteFunctionModal } from "./delete-function-modal";

export function FunctionCard({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const { func, updateFunction } = useFunction(functionId);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [edit, setEdit] = useState(false);
	const {
		isOpen: isDeleteOpen,
		onOpen: onDeleteOpen,
		onClose: onDeleteClose,
	} = useDisclosure();

	function saveName() {
		const newName = nameInputRef.current?.value;
		if (!newName || !func.data) return;
		if (newName === func.data?.name) return setEdit(false);

		updateFunction.mutate({
			...func.data,
			name: newName,
		});
		setEdit(false);
	}

	return (
		<Card borderColor="blue.500" borderWidth={1}>
			<TSRLink
				to={Route.to}
				search={{ path: func.data?.path }}
				style={{ borderRadius: "inherit" }}
			>
				<Flex
					bgColor={selected ? "blue.50" : undefined}
					display="flex"
					borderRadius="inherit"
					alignItems="center"
					p={2}
				>
					{edit ? (
						<Input
							autoFocus
							type="text"
							required
							ref={nameInputRef}
							name="name"
							defaultValue={func.data?.name}
							onClick={(e) => {
								e.preventDefault();
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									saveName();
								}
							}}
						/>
					) : (
						<Text
							fontWeight="bold"
							as="span"
							display="flex"
							w="100%"
							paddingLeft="10px"
						>
							{func.data?.name}
						</Text>
					)}
					<Flex alignItems="center">
						{edit ? (
							<>
								<IconButton
									colorScheme="gray"
									variant="ghost"
									aria-label="save"
									icon="check"
									type="button"
									onClick={(e) => {
										e.preventDefault();
										saveName();
									}}
								/>
								<IconButton
									colorScheme="gray"
									variant="ghost"
									aria-label="delete"
									icon="delete"
									type="button"
									onClick={onDeleteOpen}
								/>
							</>
						) : (
							<>
								<IconButton
									type="button"
									colorScheme="gray"
									variant="ghost"
									aria-label="edit"
									icon="edit"
									onClick={(e) => {
										e.preventDefault();
										setEdit(true);
									}}
								/>
								<Icon
									icon={selected ? "arrow_back_ios" : "arrow_forward_ios"}
								/>
							</>
						)}
					</Flex>
				</Flex>
			</TSRLink>
			<DeleteFunctionModal
				onOpen={onDeleteOpen}
				onClose={() => {
					setEdit(false);
					onDeleteClose();
				}}
				isOpen={isDeleteOpen}
				functionId={functionId}
			/>
		</Card>
	);
}
