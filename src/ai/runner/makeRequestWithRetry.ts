import { Provider } from '../types';
import { makeRequest } from './makeRequest';

export async function makeRequestWithRetry(runner: any, provider: Provider, messages: any[], tools: any[], attempt: number = 1): Promise<any> {
    const context = {
        provider: provider.name,
        url: provider.url,
        attempt: attempt,
        messageCount: messages.length,
        toolCount: tools.length,
        maxAttempts: runner.options.retryAttempts
    };

    try {
        runner.emit('makeRequestAttempt', context);
        runner.logger.debug(`[makeRequestWithRetry] Attempting request to provider`, context);
        return await makeRequest(runner, provider, messages, tools);
    } catch (error) {
        if (attempt < runner.options.retryAttempts) {
            const retryContext = {
                ...context,
                error: (error as Error).message,
                nextAttemptIn: `${runner.options.retryDelay}ms`
            };
            runner.emit('makeRequestRetry', retryContext);
            runner.logger.warn(`[makeRequestWithRetry] Request failed, retrying`, retryContext);
            await new Promise(resolve => setTimeout(resolve, runner.options.retryDelay));
            return makeRequestWithRetry(runner, provider, messages, tools, attempt + 1);
        }
        const maxRetryContext = {
            ...context,
            error: (error as Error).message,
            stack: (error as Error).stack?.split('\n').slice(0, 3).join('\n') // Only log first 3 lines of stack trace
        };
        runner.emit('makeRequestMaxRetryReached', maxRetryContext);
        runner.logger.error('[makeRequestWithRetry] Max retry attempts reached', maxRetryContext);
        throw error;
    }
}
