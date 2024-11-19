import { FormControl, FormLabel, Input } from "@kvib/react";

export const BackstageInput = ({
	defaultValue = "",
}: {
	defaultValue?: string;
}) => {
	return (
		<FormControl isRequired={false}>
			<FormLabel
				style={{
					fontSize: "small",
					fontWeight: "medium",
				}}
			>
				Lenke til utviklerportalen
			</FormLabel>
			<Input
				name="backstage-url"
				placeholder="Sett inn lenke"
				type="url"
				variant="outline"
				size="sm"
				borderRadius="5px"
				defaultValue={defaultValue}
			/>
		</FormControl>
	);
};
