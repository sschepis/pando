import { Config } from "../../../../ai/types";

export const presentCutscene: Config['tools'][0] = {
    type: 'function',
    function: {
        name: 'presentCutscene',
        description: 'Generate and present a cutscene to the player using AI',
        parameters: {
            type: 'object',
            properties: {
                gameState: { type: 'object', description: 'The current state of the game' },
                storyProgress: { type: 'number', description: 'The current progress in the main story (0-100)' },
                triggerEvent: { type: 'string', description: 'The event that triggered the cutscene' },
                playerCharacter: { type: 'object', description: 'Information about the player character' }
            },
            required: ['gameState', 'storyProgress', 'triggerEvent', 'playerCharacter']
        },
        script: async (parameters: any, context: any) => {
            const prompt = `
                Game state: ${JSON.stringify(parameters.gameState)}
                Story progress: ${parameters.storyProgress}
                Trigger event: ${parameters.triggerEvent}
                Player character: ${JSON.stringify(parameters.playerCharacter)}

                Based on the current game state, story progress, trigger event, and player character:
                1. Generate an engaging cutscene that advances the story
                2. Include relevant characters and their dialogues
                3. Describe the setting and any important visual elements
                4. Incorporate any dramatic reveals or plot twists if appropriate
                5. Ensure the cutscene aligns with the overall narrative and player's actions

                Provide the cutscene in the following JSON format:
                {
                    "cutsceneText": "Detailed description of the cutscene",
                    "dialogues": [
                        // Array of character dialogues
                    ],
                    "visualDescriptions": [
                        // Array of key visual elements to be depicted
                    ],
                    "musicMood": "Suggested mood for background music",
                    "revealedInformation": [
                        // Array of new information revealed to the player
                    ],
                    "playerChoices": [
                        // Array of choices for the player at the end of the cutscene (if any)
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
