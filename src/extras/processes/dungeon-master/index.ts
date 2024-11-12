import { Config } from "../../../ai/types";

// Import prompts
import { dungeonMasterMain } from "./prompts/dungeonMasterMain";
import { imageGeneration } from "./prompts/imageGeneration";
import { cutsceneGeneration } from "./prompts/cutsceneGeneration";

// Import tools
import { interpretPlayerAction } from "./tools/interpretPlayerAction";
import { generateImage } from "./tools/generateImage";
import { updateGameMap } from "./tools/updateGameMap";
import { manageQuests } from "./tools/manageQuests";
import { evolveGameWorld } from "./tools/evolveGameWorld";
import { presentCutscene } from "./tools/presentCutscene";

export const prompts: Config['prompts'] = [
    dungeonMasterMain,
    imageGeneration,
    cutsceneGeneration
];

export const tools: Config['tools'] = [
    interpretPlayerAction,
    generateImage,
    updateGameMap,
    manageQuests,
    evolveGameWorld,
    presentCutscene
];
