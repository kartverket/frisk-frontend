import { Flex, Text } from "@kvib/react";
import { FunctionColumn } from "./function-column";
import { getIdsFromPath } from "@/lib/utils";
import { Route } from "@/routes";
import {
	DndContext,
	DragOverEvent,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";

type FunctionColumnViewProps = {
	path: string;
};

export function FunctionColumnView({ path }: FunctionColumnViewProps) {
	const navigate = Route.useNavigate();

	const selectedFunctionIds = getIdsFromPath(path);
	const [legalDroppable, setLegalDroppable] = useState<boolean>(false);

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

		if (over) {
			if (active.data.current && over.id !== active.id) {
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
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (over) {
			if (over.id !== active.id) {
				setLegalDroppable(true);
			} else {
				setLegalDroppable(false);
			}
		} else {
			setLegalDroppable(false);
		}
	}

	return (
		<DndContext
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			sensors={sensors}
		>
			<Flex
				flexDirection="column"
				paddingY="38"
				paddingX="100"
				marginBottom="76"
			>
				<Text fontSize="2xl" fontWeight="700" marginBottom="3">
					Funksjonsregisteret
				</Text>
				<Text fontSize="xs" marginBottom="38">
					Smell opp noen bra funksjoner og få den oversikten du fortjener
				</Text>
				<Flex>
					{selectedFunctionIds?.map((id) => (
						<FunctionColumn
							legalDroppable={legalDroppable}
							key={id}
							functionId={id}
						/>
					))}
				</Flex>
			</Flex>
		</DndContext>
	);
}
