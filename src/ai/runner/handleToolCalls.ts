import { AIError, ToolError } from '../../errors';
import { executeFunction } from './executeFunction';
import { Config, Provider } from '../types';

export async function handleToolCalls(
    runner: any,
    toolCalls: any[] | undefined,
    context: any,
    prompt: Config['prompts'][0],
    args: Record<string, any>,
    provider: Provider
): Promise<{ result: any; state: any } | undefined> {
    if (!toolCalls?.length) {
        return undefined;
    }

    try {
        for (const toolCall of toolCalls) {
            const toolName = provider.responseFormat.getToolName?.(toolCall) ?? 
                           (toolCall.name || toolCall.function?.name);
            const toolArgs = provider.responseFormat.getToolArgs?.(toolCall) ?? 
                           (toolCall.arguments || toolCall.function?.arguments);

            if (!toolName) {
                throw new AIError('Tool name not found in tool call');
            }

            runner.emit('toolCall', { ...context, toolName, toolArgs });
            runner.logger.debug(`[handleToolCalls] Executing tool: ${toolName}`, { toolArgs });

            try {
                const result = await executeFunction(runner, toolName, toolArgs);
                runner.state = { ...runner.state, toolResult: result };
            } catch (error: unknown) {
                throw new ToolError(
                    toolName,
                    error instanceof Error ? error.message : String(error),
                    error
                );
            }
        }

        // If there are tool calls and repeat is not explicitly set to false, we re-run the prompt
        if (prompt.repeat !== false) {
            runner.emit('repeatPrompt', context);
            runner.logger.debug('[handleToolCalls] Repeating prompt execution');
            return { result: runner.state, state: runner.state };
        }
    } catch (error: unknown) {
        throw new AIError(
            `Error handling tool calls: ${error instanceof Error ? error.message : String(error)}`,
            error
        );
    }

    return undefined;
}
