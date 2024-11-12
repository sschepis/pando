import { Prompt, Provider } from '../types';
import { AIError } from '../../errors';
import { interpolate } from '../utils';
import { executePrompt } from './executePrompt';
import { executeFunction } from './executeFunction';

export async function handleThenSection(
    runner: any,
    prompt: Prompt,
    result: any,
    context: any,
    provider: Provider
): Promise<{ result: any; state: any } | undefined> {
    if (!prompt.then) {
        return undefined;
    }

    try {
        // Interpolate variables in conditions
        const interpolatedArgs = interpolate(result, runner.state);

        // Find matching condition
        for (const [condition, action] of Object.entries(prompt.then)) {
            const conditionResult = new Function(
                ...Object.keys(interpolatedArgs),
                `return ${condition}`
            )(...Object.values(interpolatedArgs));

            if (conditionResult) {
                runner.logger.debug(`[handleThenSection] Condition matched: ${condition}`, { action });

                if (action.prompt) {
                    const nextPrompt = runner.config.prompts.find((p: Prompt) => p.name === action.prompt);
                    if (!nextPrompt) {
                        throw new AIError(`Next prompt "${action.prompt}" not found`);
                    }

                    return executePrompt(runner, nextPrompt, {
                        ...interpolatedArgs,
                        ...action.arguments
                    }, provider);
                }

                if (action.function) {
                    const result = await executeFunction(runner, action.function, {
                        ...interpolatedArgs,
                        ...action.arguments
                    });

                    return { result, state: runner.state };
                }
            }
        }
    } catch (error: unknown) {
        throw new AIError(
            `Error handling then section: ${error instanceof Error ? error.message : String(error)}`,
            error
        );
    }

    return undefined;
}
