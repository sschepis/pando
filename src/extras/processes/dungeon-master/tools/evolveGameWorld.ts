import { Config } from "../../../../ai/types";

export const evolveGameWorld: Config['tools'][0] = {
    type: 'function',
    function: {
        name: 'evolveGameWorld',
        description: 'Evolve the game world based on player actions and time passage using AI',
        parameters: {
            type: 'object',
            properties: {
                gameWorld: { type: 'object', description: 'The current state of the game world' },
                playerActions: { type: 'array', description: 'Recent actions taken by the player' },
                timePassed: { type: 'number', description: 'Amount of in-game time that has passed' },
                worldEvents: { type: 'array', description: 'Major events that have occurred in the game world' }
            },
            required: ['gameWorld', 'playerActions', 'timePassed']
        },
        script: async (parameters: any, context: any) => {
            const prompt = `
                Current game world state: ${JSON.stringify(parameters.gameWorld)}
                Player actions: ${JSON.stringify(parameters.playerActions)}
                Time passed: ${parameters.timePassed} (in-game time units)
                World events: ${JSON.stringify(parameters.worldEvents || [])}

                Based on the current game world state, player actions, time passed, and any world events:
                1. Evolve the game world naturally (e.g., seasons changing, populations growing/declining)
                2. Incorporate consequences of player actions on the world
                3. Trigger new events or developments based on the time passed
                4. Update NPC behaviors and relationships
                5. Modify available resources, quests, or challenges

                Provide the evolved game world state in the following JSON format:
                {
                    "evolvedWorld": {
                        // Updated game world structure
                    },
                    "majorChanges": [
                        // Array of significant changes in the world
                    ],
                    "newEvents": [
                        // Array of new events triggered by the evolution
                    ],
                    "npcUpdates": [
                        // Array of updates to NPCs' states or behaviors
                    ],
                    "environmentalChanges": [
                        // Array of changes to the game's environment
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
