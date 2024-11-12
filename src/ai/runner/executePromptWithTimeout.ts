import { Config, Provider } from '../types';
import { AIError } from '../../errors';
import { executePrompt } from './executePrompt';

export async function executePromptWithTimeout(
    runner: any,
    prompt: Config['prompts'][0],
    args: Record<string, any>,
    provider: Provider
): Promise<{ result: any; state: any }> {
    const timeout = prompt.timeout || runner.options.timeout || 30000;
    const maxAttempts = prompt.maxAttempts || runner.options.retryAttempts || 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new AIError(`Execution timed out after ${timeout}ms`)), timeout);
            });

            const executionPromise = executePrompt(runner, prompt, args, provider);
            const result = await Promise.race([executionPromise, timeoutPromise]);
            return result as { result: any; state: any };
        } catch (error: unknown) {
            lastError = error;
            runner.logger.warn(`Attempt ${attempt} failed`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            if (attempt < maxAttempts) {
                const delay = runner.options.retryDelay || 1000;
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    throw new AIError(
        `Failed after ${maxAttempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
        lastError
    );
}
