import { Provider } from '../types';
import { AIError } from '../../errors';
import { interpolateArgs, evaluateConditions } from '../utils';
import { executePrompt } from './executePrompt';

export async function runWithDepth(
    runner: any,
    promptName: string,
    args: Record<string, any>,
    provider: Provider
): Promise<{ result: any; state: any }> {
    const maxDepth = runner.options.maxDepth || 10;

    if (runner.depth >= maxDepth) {
        const maxDepthContext = {
            depth: runner.depth,
            maxDepth,
            promptName,
            args
        };
        runner.logger.warn(`[runWithDepth] Max depth reached`, maxDepthContext);
        throw new AIError('Max depth reached');
    }

    const prompt = runner.config.prompts.find((p: any) => p.name === promptName);
    if (!prompt) {
        const promptNotFoundContext = {
            promptName,
            availablePrompts: runner.config.prompts.map((p: any) => p.name)
        };
        runner.logger.error(`[runWithDepth] Prompt not found`, promptNotFoundContext);
        throw new AIError(`Prompt "${promptName}" not found`);
    }

    try {
        runner.depth++;
        const result = await executePrompt(runner, prompt, args, provider);
        runner.depth--;
        return result;
    } catch (error: unknown) {
        runner.depth--;
        throw new AIError(
            `Error running prompt "${promptName}": ${error instanceof Error ? error.message : String(error)}`,
            error
        );
    }
}
