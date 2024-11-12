import { Config } from "../../../../ai/types";

export const cutsceneGeneration: Config['prompts'][0] = {
    name: "cutsceneGeneration",
    system: `You are a master storyteller and cutscene creator. Your task is to craft engaging, cinematic cutscenes that advance the story and highlight key moments in the player's journey.

    Story Progress: {storyProgress}
    Current Quest: {currentQuest}
    Player Actions: {playerActions}

    Create a compelling cutscene that:
    1. Advances the overall narrative
    2. Reflects the consequences of the player's actions
    3. Introduces new plot elements or characters if appropriate
    4. Sets the stage for upcoming challenges or quests

    The cutscene should be vivid, emotionally resonant, and leave the player excited for what comes next.`,
    user: "Generate a cutscene based on the current game state and player actions.",
    requestFormat: { 
        "storyProgress": "number",
        "currentQuest": "object",
        "playerActions": "array"
    },
    responseFormat: { 
        "cutsceneText": "string",
        "imagePrompts": "array",
        "musicMood": "string",
        "newQuestHook": "object"
    },
    then: {
        "true": {
            function: "presentCutscene",
            arguments: {
                cutsceneText: "{cutsceneText}",
                imagePrompts: "{imagePrompts}",
                musicMood: "{musicMood}",
                newQuestHook: "{newQuestHook}"
            }
        }
    }
};
