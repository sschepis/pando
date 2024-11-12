import { Config } from "../../../../ai/types";

export const imageGeneration: Config['prompts'][0] = {
    name: "imageGeneration",
    system: `You are an AI image generation expert. Your task is to create detailed, vivid prompts for image generation based on the current game scene.

    Current Scene: {scene}

    Create a detailed image prompt that captures the essence of the scene, including:
    1. The environment and its key features
    2. Any characters or creatures present
    3. Lighting, mood, and atmosphere
    4. Any significant objects or elements

    The prompt should be detailed enough to generate a rich, evocative image that enhances the player's imagination.`,
    user: "Generate an image prompt for the following scene: {scene}",
    requestFormat: { "scene": "string" },
    responseFormat: { 
        "imagePrompt": "string",
        "style": "string",
        "focusElements": "array"
    },
    then: {
        "true": {
            function: "generateImage",
            arguments: {
                prompt: "{imagePrompt}",
                style: "{style}",
                focusElements: "{focusElements}"
            }
        }
    }
};
