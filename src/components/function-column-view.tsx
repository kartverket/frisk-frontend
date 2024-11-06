import { Flex, Text } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	DndContext,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";

type FunctionColumnViewProps = {
	path: string;
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const navigate = Route.useNavigate();

	const selectedFunctionIds = getIdsFromPath(path);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 5,
			},
		}),
	);

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (over && active.data.current) {
			await active.data.current.update.mutateAsync({
				...active.data.current.func,
				parentId: Number(over.id),
			});
			navigate({
				search: {
					path: active.data.current.func.path,
				},
			});
		}
	}

	return (
		<Flex flexDirection="column" paddingY="38" paddingX="100" marginBottom="76">
			<Text fontSize="2xl" fontWeight="700" marginBottom="3">
				Funksjonsregisteret
			</Text>
			<Text fontSize="xs" marginBottom="38">
				Smell opp noen bra funksjoner og få den oversikten du fortjener
			</Text>
			<DndContext onDragEnd={handleDragEnd} sensors={sensors}>
				<Flex>
					{selectedFunctionIds?.map((id) => (
						<FunctionColumn key={id} functionId={id} />
					))}
				</Flex>
			</DndContext>
		</Flex>
	);
}
