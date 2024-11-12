import { DebuggerInterface } from '../types/DebuggerInterface';
import { VSCodeLogger } from './logger';
import { Config } from './types';
import { executePrompt } from './runner/executePrompt';
import { executePromptWithTimeout } from './runner/executePromptWithTimeout';

export class AIAssistant {
    private debuggerInterface: DebuggerInterface | null = null;
    private config: Config;
    private logger: VSCodeLogger;

    constructor(config: Config, options: any, logger: VSCodeLogger) {
        this.config = config;
        this.logger = logger;
    }

    async executePrompt(promptName: string, args: any = {}) {
        try {
            const prompt = this.config.prompts.find(p => p.name === promptName);
            if (!prompt) {
                throw new Error(`Prompt "${promptName}" not found`);
            }

            const result = await executePromptWithTimeout(
                this,
                prompt,
                args,
                this.config.provider
            );

            return result;
        } catch (error) {
            this.logger.error(`Error executing prompt ${promptName}:`, error);
            throw error;
        }
    }

    async processQuery(query: string): Promise<any> {
        try {
            const result = await this.executePrompt('default', { query });
            return result;
        } catch (error) {
            this.logger.error(`Error processing query: ${error}`);
            throw error;
        }
    }

    getDebuggerInterface(): DebuggerInterface | null {
        return this.debuggerInterface;
    }

    setDebuggerInterface(debuggerInterface: DebuggerInterface) {
        this.debuggerInterface = debuggerInterface;
    }

    getConfig(): Config {
        return this.config;
    }

    getLogger(): VSCodeLogger {
        return this.logger;
    }
}
