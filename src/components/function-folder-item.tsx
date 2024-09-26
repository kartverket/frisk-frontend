import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { BackendFunction } from "@/services/backend";
import { Card, Flex, Icon, IconButton, Input, Text } from "@kvib/react";
import { Link as TSRLink } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";

export function FunctionFolderItem({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const { func, updateFunction, removeFunction } = useFunction(functionId);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [edit, setEdit] = useState(false);
	const navigate = Route.useNavigate();

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
					<IconButton
						type="button"
						colorScheme="gray"
						variant="ghost"
						aria-label="drag"
						icon="drag_indicator"
					/>
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
							textAlign="start"
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
		</Card>
	);
}
