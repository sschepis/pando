import { Config } from "../../../../ai/types";
import { openai } from "../../../../ai/providers/openai";

export const interpretPlayerAction: Config['tools'][0] = {
    type: 'function',
    function: {
        name: 'interpretPlayerAction',
        description: 'Interpret the player\'s action using AI, considering the current context and a numeric bias',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', description: 'The action taken by the player' },
                currentContext: { type: 'object', description: 'The current game state and relevant information' },
                interpretationGuide: { type: 'string', description: 'A guide for interpreting player actions' },
                numericBias: { type: 'number', description: 'A numeric value (0-100) to bias the interpretation towards a certain direction' }
            },
            required: ['action', 'currentContext', 'interpretationGuide', 'numericBias']
        },
        script: async (parameters: any, context: any) => {
            const prompt = `
                Current game context: ${JSON.stringify(parameters.currentContext)}
                Player action: ${parameters.action}
                Interpretation guide: ${parameters.interpretationGuide}
                Numeric bias (0-100): ${parameters.numericBias}

                Based on the above information, interpret the player's action and its effects on the game state. 
                Consider the numeric bias in your interpretation, where higher values indicate a more favorable outcome for the player.
                
                Provide your interpretation in the following JSON format:
                {
                    "interpretation": "Detailed interpretation of the player's action",
                    "effects": ["Array of effects on the game state"],
                    "successProbability": "A number between 0 and 1 indicating the probability of success",
                    "updatedGameState": "A description of how the game state should be updated"
                }
            `;

            const response = await context.chatJSON([
                { role: "user", content: prompt }
            ]);

            return JSON.parse(response.content);
        }
    }
};
