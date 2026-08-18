import { envConfig } from "@/config/env";

export type City = {
    name: string;
    placeId: string;
};

export type State = {
    name: string;
    placeId: string;
};

const apiKey = envConfig.GOOGLEAPI;

const countryCode = "IN";

type GoogleSuggestion = {
    placePrediction?: {
        placeId: string;
        text?: {
            text: string;
        };
        structuredFormat?: {
            mainText?: {
                text: string;
            };
            secondaryText?: {
                text: string;
            };
        };
        types?: string[];
    };
};

type GoogleAutocompleteResponse = {
    suggestions?: GoogleSuggestion[];
};

async function autocomplete(
    input: string,
    includedPrimaryTypes: string
): Promise<GoogleSuggestion[]> {
    if (!input?.trim()) {
        return [];
    }

    const response = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
            },
            body: JSON.stringify({
                input: input.trim(),
                includedPrimaryTypes: [includedPrimaryTypes],
                includedRegionCodes: [countryCode],
                languageCode: "en",
            }),
        }
    );

    const data: GoogleAutocompleteResponse = await response.json();

    if (!response.ok) {
        throw new Error(
            (data as any)?.error?.message ||
            "Failed to fetch autocomplete results"
        );
    }

    return data.suggestions ?? [];
}

export async function getStates(
    input: string = "a"
): Promise<State[]> {
    try {
        const suggestions = await autocomplete(input, "(regions)");

        return suggestions
            .filter(
                (suggestion) =>
                    suggestion.placePrediction
            )
            .map((suggestion) => {
                const prediction = suggestion.placePrediction!;

                return {
                    name:
                        prediction.structuredFormat?.mainText?.text ||
                        prediction.text?.text ||
                        "",
                    placeId: prediction.placeId,
                };
            })
            .filter((state) => state.name);
    } catch (error) {
        console.error("Error fetching states:", error);
        return [];
    }
}

export async function getCities(
    query: string
): Promise<City[]> {
    try {
        const suggestions = await autocomplete(query, "(cities)");

        return suggestions
            .filter(
                (suggestion) =>
                    suggestion.placePrediction
            )
            .map((suggestion) => {
                const prediction = suggestion.placePrediction!;

                return {
                    name:
                        prediction.structuredFormat?.mainText?.text ||
                        prediction.text?.text ||
                        "",
                    placeId: prediction.placeId,
                };
            })
            .filter((city) => city.name);
    } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
}

export async function getCitiesByState(
    query: string,
    state: string
): Promise<City[]> {
    if (!query?.trim() || !state?.trim()) {
        return [];
    }

    try {
        const suggestions = await autocomplete(query, "(cities)");

        return suggestions
            .filter((suggestion) => {
                const prediction = suggestion.placePrediction;

                if (!prediction) return false;

                const fullText =
                    prediction.text?.text ||
                    "";

                const secondaryText =
                    prediction.structuredFormat
                        ?.secondaryText?.text ||
                    "";

                return (
                    fullText
                        .toLowerCase()
                        .includes(state.toLowerCase()) ||
                    secondaryText
                        .toLowerCase()
                        .includes(state.toLowerCase())
                );
            })
            .map((suggestion) => {
                const prediction =
                    suggestion.placePrediction!;

                return {
                    name:
                        prediction.structuredFormat?.mainText?.text ||
                        prediction.text?.text ||
                        "",
                    placeId: prediction.placeId,
                };
            })
            .filter((city) => city.name);
    } catch (error) {
        console.error("Error fetching cities by state:", error);
        return [];
    }
}