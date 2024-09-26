import { useFunction } from "@/hooks/use-function";
import { Route } from "@/routes";
import { Card, Flex, IconButton, Input, Text } from "@kvib/react";
import { Link as TSRLink } from "@tanstack/react-router";
import { useRef, useState } from "react";

export function FunctionFolderItem({
	functionId,
	selected,
}: { functionId: number; selected: boolean }) {
	const { func, updateFunction } = useFunction(functionId);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [edit, setEdit] = useState(false);

	function saveName() {
		const newName = nameInputRef.current?.value;
		if (!newName || !func.data) return;
		if (newName === func.data?.name) return setEdit(false);

		updateFunction.mutate(
			{
				...func.data,
				name: newName,
			},
			{
				onError: () => {
					setEdit(true);
				},
			},
		);
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
							type="text"
							required
							ref={nameInputRef}
							name="name"
							defaultValue={func.data?.name}
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
					<Flex>
						{edit ? (
							<IconButton
								colorScheme="gray"
								variant="ghost"
								aria-label="save"
								icon="check"
								type="button"
								onClick={saveName}
							/>
						) : (
							<IconButton
								type="button"
								colorScheme="gray"
								variant="ghost"
								aria-label="edit"
								icon="edit"
								onClick={() => setEdit(true)}
							/>
						)}
						<IconButton
							type="button"
							colorScheme="gray"
							variant="ghost"
							aria-label="drag"
							icon="drag_indicator"
						/>
						<IconButton
							type="button"
							colorScheme="gray"
							variant="ghost"
							aria-label={selected ? "close" : "open"}
							icon={selected ? "arrow_back_ios" : "arrow_forward_ios"}
						/>
					</Flex>
				</Flex>
			</TSRLink>
		</Card>
	);
}
