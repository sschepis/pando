import { Config } from '../types';
import { AIError } from '../../errors';

export async function makeRequest(runner: any, provider: Config['provider'], messages: any[], tools?: any[]) {
    try {
        const formattedMessages = messages.map(provider.requestObject.getMessage);
        const options = provider.requestObject.getOptions({
            messages: formattedMessages,
            tools: tools?.length ? provider.toolFormat.formatTools(tools) : undefined
        });

        runner.logger.debug('[makeRequest] Making request to provider', { 
            provider: provider.name,
            options
        });

        const response = await provider.client.post(provider.path, options);
        runner.logger.debug('[makeRequest] Provider response received', { 
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error: unknown) {
        const errorContext = {
            provider: provider.name,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        };
        runner.logger.error('[makeRequest] Error making request to provider', errorContext);

        throw new AIError(
            `Error making request to provider: ${error instanceof Error ? error.message : String(error)}`,
            error
        );
    }
}
