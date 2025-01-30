import { SearchAsync, Box, Text } from "@kvib/react";
import { getFunctions } from "@/services/backend";
import { Route } from "@/routes";

export function SearchField() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	return (
		<Box maxW="400px">
			<Text fontSize="sm" as="b" color="blue.500">
				Søk
			</Text>
			<Box bg="white">
				<SearchAsync
					size="sm"
					debounceTime={300}
					defaultOptions
					loadOptions={async (inputValue, callback) => {
						const functions = await getFunctions(inputValue.trim());

						const filteredOptions = functions.map((f) => ({
							value: f.path,
							label: f.name,
						}));
						callback(filteredOptions);
					}}
					onChange={(newFunc: { value: string } | null) => {
						if (newFunc) {
							navigate({
								search: {
									...search,
									path: [newFunc.value],
								},
							});
						}
					}}
					placeholder="Søk på funksjonsnavnet her..."
				/>
			</Box>
		</Box>
	);
}
