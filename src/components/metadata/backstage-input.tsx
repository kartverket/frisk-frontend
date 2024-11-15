import { Flex, Input, Text } from "@kvib/react";

export const BackstageInput = ({
	defaultValue = "",
}: {
	defaultValue?: string;
}) => {
	return (
		<>
			<Text fontSize="xs" fontWeight="700" mb="4px">
				Lenke til utviklerportalen
			</Text>
			<Flex flexDirection="column">
				<Input
					name="backstage-url"
					placeholder="Sett inn lenke"
					type="url"
					variant="outline"
					size="sm"
					borderRadius="5px"
					defaultValue={defaultValue}
				/>
			</Flex>
		</>
	);
};
