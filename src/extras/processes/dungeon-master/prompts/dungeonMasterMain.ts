import { Config } from "../../../../ai/types";

export const dungeonMasterMain: Config['prompts'][0] = {
    name: "dungeonMasterMain",
    system: `You are an advanced AI Dungeon Master, capable of creating and managing an immersive, evolving text-based adventure game. Your role is to craft engaging narratives, manage game mechanics, and provide a rich, interactive experience for the player.

    Current Game State:
    Player: {state.player}
    Location: {state.currentLocation}
    Quest: {state.currentQuest}
    Inventory: {state.inventory}
    Game World: {state.gameWorld}
    Story Progress: {state.storyProgress}

    Instructions:
    1. Narrate the current situation and present choices to the player.
    2. Interpret player actions and update the game state accordingly.
    3. Generate imagery for key scenes and locations.
    4. Update the game map as the player explores.
    5. Manage quests, NPCs, and world events.
    6. Craft engaging storytelling cutscenes at dramatic moments.
    7. Ensure the game world evolves based on player actions and time passage.

    Always strive to create an engaging, personalized adventure that responds dynamically to the player's choices.`,
    user: "{playerInput}",
    requestFormat: { 
        "playerInput": "string",
        "player": "object",
        "currentLocation": "object",
        "currentQuest": "object",
        "inventory": "array",
        "gameWorld": "object",
        "storyProgress": "number"
    },
    responseFormat: { 
        "narrative": "string",
        "choices": "array",
        "updateState": "object",
        "generateImage": "boolean",
        "updateMap": "boolean",
        "triggerCutscene": "boolean"
    },
    tools: ['interpretPlayerAction', 'generateImagePrompt', 'updateGameMap', 'manageQuests', 'evolveGameWorld', 'generateCutscene'],
    then: {
        "generateImage === true": {
            prompt: "imageGeneration",
            arguments: {
                scene: "{narrative}"
            }
        },
        "updateMap === true": {
            function: "updateGameMap",
            arguments: {
                currentLocation: "{state.currentLocation}",
                newAreas: "{updateState.newAreas}"
            }
        },
        "triggerCutscene === true": {
            prompt: "cutsceneGeneration",
            arguments: {
                storyProgress: "{state.storyProgress}",
                currentQuest: "{state.currentQuest}",
                playerActions: "{state.playerActions}"
            }
        },
        "true": {
            prompt: "dungeonMasterMain",
            arguments: {
                playerInput: "What do you do next?",
                player: "{state.player}",
                currentLocation: "{updateState.currentLocation || state.currentLocation}",
                currentQuest: "{updateState.currentQuest || state.currentQuest}",
                inventory: "{updateState.inventory || state.inventory}",
                gameWorld: "{updateState.gameWorld || state.gameWorld}",
                storyProgress: "{updateState.storyProgress || state.storyProgress}"
            }
        }
    }
};
