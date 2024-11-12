import * as vscode from 'vscode';
import { AIAssistant } from './ai/AIAssistant';
import { Config } from './ai/types';
import { PandoPrompt } from './pandoExecutionEngine/types';
import { createLogger } from './ai/logger';
import { parsePrompt } from './pandoExecutionEngine/parser';

export class PandoVSCodeBridge {
    private aiAssistant: AIAssistant;

    constructor(config: Config, context: vscode.ExtensionContext) {
        const logger = createLogger(context);
        this.aiAssistant = new AIAssistant(config, {}, logger);
    }

    async executePandoFile(fileContent: string): Promise<any> {
        const pandoPrompt: PandoPrompt = parsePrompt(fileContent);
        
        // Convert Pando prompt to the format expected by the core AI system
        const corePrompt = this.convertPandoPromptToCorePrompt(pandoPrompt);

        // Execute the prompt using the core AI system
        const result = await this.aiAssistant.processQuery(JSON.stringify(corePrompt));

        return result;
    }

    private convertPandoPromptToCorePrompt(pandoPrompt: PandoPrompt): any {
        // Convert the Pando prompt to the format expected by the core AI system
        return {
            name: pandoPrompt.name,
            system: pandoPrompt.systemPrompt,
            user: pandoPrompt.userPrompt,
            requestFormat: pandoPrompt.input,
            responseFormat: pandoPrompt.output,
            tools: Object.keys(pandoPrompt.tools || {}),
            then: {
                "true": {
                    function: "completeTask",
                    arguments: "{result}"
                }
            }
        };
    }
}
