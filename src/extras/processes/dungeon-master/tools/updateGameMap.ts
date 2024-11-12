import { Config } from "../../../../ai/types";
import { openai } from "../../../../ai/providers/openai";

export const updateGameMap: Config['tools'][0] = {
    type: 'function',
    function: {
        name: 'updateGameMap',
        description: 'Update the game map based on the player\'s exploration using AI',
        parameters: {
            type: 'object',
            properties: {
                currentLocation: { type: 'object', description: 'The player\'s current location' },
                newAreas: { type: 'array', description: 'New areas discovered by the player' },
                currentMap: { type: 'object', description: 'The current state of the game map' }
            },
            required: ['currentLocation', 'currentMap']
        },
        script: async (parameters: any, context: any) => {
            const prompt = `
                Current location: ${JSON.stringify(parameters.currentLocation)}
                New areas discovered: ${JSON.stringify(parameters.newAreas)}
                Current map: ${JSON.stringify(parameters.currentMap)}

                Based on the player's current location and any newly discovered areas, update the game map.
                Consider the following:
                1. Add new areas to the map
                2. Update connections between areas
                3. Add or update points of interest
                4. Ensure consistency with the existing map

                Provide the updated map in the following JSON format:
                {
                    "updatedMap": {
                        // Updated map structure
                    },
                    "changes": [
                        // Array of changes made to the map
                    ],
                    "newAreasAdded": [
                        // Array of new areas added to the map
                    ]
                }
            `;

            const response = await context.chatJSON([
                { role: "user", content: prompt }
            ]);

            return JSON.parse(response.content);
        }
    }
};
