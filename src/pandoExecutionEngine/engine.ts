import { AIAssistant } from '../ai/AIAssistant';
import { PandoExecutionEngineOptions, PandoPrompt, PandoState } from './types';
import { ExecutionContext } from './context';
import { Evaluator } from './evaluator';
import { parsePrompt } from './parser';
import { log } from './logger';
import { ParseError, ExecutionError } from '../errors';

export class PandoExecutionEngine {
    private aiAssistant: AIAssistant;
    private context: ExecutionContext;
    private evaluator: Evaluator;

    constructor(options: PandoExecutionEngineOptions) {
        this.aiAssistant = options.aiAssistant;
        this.context = new ExecutionContext();
        this.evaluator = new Evaluator(this.context);
    }

    async execute(promptContent: string, initialState?: PandoState): Promise<any> {
        log('Starting prompt execution');

        try {
            // Parse the prompt
            const prompt = parsePrompt(promptContent);
            log('Prompt parsed successfully');

            // Initialize state
            if (initialState) {
                this.context.variables = { ...initialState.variables };
            }

            // Execute the prompt
            return await this.executePrompt(prompt);
        } catch (error: unknown) {
            if (error instanceof ParseError || error instanceof ExecutionError) {
                throw error;
            }
            throw new ExecutionError(
                `Failed to execute prompt: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    private async executePrompt(prompt: PandoPrompt): Promise<any> {
        try {
            // Execute each statement in the prompt
            for (const statement of prompt.statements) {
                await this.evaluator.evaluateStatement(statement);
            }

            return this.context.variables;
        } catch (error: unknown) {
            throw new ExecutionError(
                `Error during prompt execution: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    async processQuery(query: string): Promise<any> {
        try {
            const aiResponse = await this.aiAssistant.processQuery(
                `Process the following query using the Pando execution engine: ${query}`
            );

            return aiResponse;
        } catch (error: unknown) {
            throw new ExecutionError(
                `Failed to process query: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    getContext(): ExecutionContext {
        return this.context;
    }
}

export function createPandoExecutionEngine(aiAssistant: AIAssistant): PandoExecutionEngine {
    return new PandoExecutionEngine({ aiAssistant });
}
