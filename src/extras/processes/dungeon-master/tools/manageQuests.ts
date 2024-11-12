import { Config } from "../../../../ai/types";
import { openai } from "../../../../ai/providers/openai";

export const manageQuests: Config['tools'][0] = {
    type: 'function',
    function: {
        name: 'manageQuests',
        description: 'Manage active quests, update progress, and generate new quests using AI',
        parameters: {
            type: 'object',
            properties: {
                currentQuests: { type: 'array', description: 'Currently active quests' },
                playerActions: { type: 'array', description: 'Recent actions taken by the player' },
                gameWorld: { type: 'object', description: 'The current state of the game world' },
                playerLevel: { type: 'number', description: 'The current level of the player' }
            },
            required: ['currentQuests', 'playerActions', 'gameWorld', 'playerLevel']
        },
        script: async (parameters: any, context: any) => {
            const prompt = `
                Current quests: ${JSON.stringify(parameters.currentQuests)}
                Player actions: ${JSON.stringify(parameters.playerActions)}
                Game world state: ${JSON.stringify(parameters.gameWorld)}
                Player level: ${parameters.playerLevel}

                Based on the current quests, player actions, game world state, and player level:
                1. Update the progress of active quests
                2. Complete any quests that have met their objectives
                3. Generate new quests appropriate for the player's level and current game state
                4. Ensure quest variety and alignment with the overall game narrative

                Provide the updated quest information in the following JSON format:
                {
                    "updatedQuests": [
                        // Array of updated active quests
                    ],
                    "completedQuests": [
                        // Array of quests that have been completed
                    ],
                    "newQuests": [
                        // Array of newly generated quests
                    ],
                    "questUpdates": [
                        // Array of narrative updates for quest progress
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
