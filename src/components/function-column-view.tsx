import { Flex, Text } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";
import { Grid, GridItem } from "@kvib/react";
import {
	DndContext,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import type { useFunction } from "@/hooks/use-function";

type FunctionColumnViewProps = {
	path: string[];
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
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
		if (
			over &&
			active.data.current &&
			active.data.current.func.parentId !== Number(over.id)
		) {
			const update = active.data.current.update as ReturnType<
				typeof useFunction
			>["updateFunction"];

			await update.mutateAsync({
				...active.data.current.func,
				parentId: Number(over.id),
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
			{/* <Grid
				id="GRID"
				// templateColumns={`repeat(${selectedFunctionIds.length}, auto)`}
				templateRows={`repeat(${path[0].length}, auto)`}
				templateAreas="&quot;header&quot;
                  &quot;nav &quot;
                  &quot;footer&quot;"
			> */}
			<DndContext onDragEnd={handleDragEnd} sensors={sensors}>
				<Flex>
					{selectedFunctionIds?.map((id) => (
						<FunctionColumn key={id[0]} functionIds={id} />
					))}
				</Flex>
			</DndContext>
			{/* </Grid> */}
		</Flex>
	);
}
