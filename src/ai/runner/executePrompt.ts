import Ajv from 'ajv'; 
import { Config, Prompt, Provider } from '../types';
import { AIError } from '../../errors';
import { formatMessages } from './formatMessages';
import { formatTools } from './formatTools';
import { makeRequestWithRetry } from './makeRequestWithRetry';
import { handleToolCalls } from './handleToolCalls';
import { handleThenSection } from './handleThenSection';

export async function executePrompt(runner: any, prompt: Config['prompts'][0], args: Record<string, any>, provider: Provider): Promise<{ result: any, state: any }> {
    const context = {
        promptName: prompt.name,
        argsKeys: Object.keys(args),
        providerName: provider.name
    };

    runner.emit('executePromptStart', context);
    runner.logger.debug(`[executePrompt] Starting prompt execution`, context);

    // Initialize work_products array and primaryTask if not present
    if (!runner.state) {
        runner.state = {};
    }
    if (!runner.state.work_products) {
        runner.state.work_products = [];
    }
    if (!runner.state.primaryTask) {
        runner.state.primaryTask = args.query || args.primaryTask || '';
    }

    // Include work_products and primaryTask in the args for formatMessages
    const messagesArgs = { ...args, state: runner.state };

    const messages = formatMessages(runner, prompt, messagesArgs);
    const tools = formatTools(runner, prompt.tools, provider);

    runner.emit('makeRequest', { ...context, messagesCount: messages.length, toolsCount: tools.length });
    const response = await makeRequestWithRetry(runner, provider, messages, tools);
    const content = provider.responseFormat.getContent(response);

    let parsedContent: Record<string, any>;
    try {
        parsedContent = JSON.parse(content || '{}');
        runner.emit('responseParseSuccess', { ...context, contentKeys: Object.keys(parsedContent) });
    } catch (error) {
        const parseErrorContext = {
            ...context,
            error: (error as Error).message,
            contentPreview: content ? content.substring(0, 100) + '...' : 'Empty content'
        };
        runner.emit('responseParseError', parseErrorContext);
        runner.logger.error('[executePrompt] Failed to parse JSON response', parseErrorContext);
        throw new AIError('Invalid JSON response from LLM', parseErrorContext);
    }

    // Validate the parsed content against the response format
    const ajv = new Ajv();
    const validate = ajv.compile(prompt.responseFormat);
    if (!validate(parsedContent)) {
        const validationErrorContext = {
            ...context,
            errors: validate.errors,
            contentKeys: Object.keys(parsedContent)
        };
        runner.emit('responseValidationError', validationErrorContext);
        runner.logger.error('[executePrompt] Response validation failed', validationErrorContext);
        throw new AIError('Response validation failed', validate.errors);
    }

    // Update state with parsed content
    runner.state = { ...runner.state, ...(parsedContent as Record<string, any>) };

    const toolCalls = provider.responseFormat.getToolCall?.(response);
    const toolCallResult = await handleToolCalls(runner, toolCalls, context, prompt, args, provider);
    if (toolCallResult) {
        return toolCallResult;
    }

    const executionResultContext = {
        ...context,
        resultKeys: Object.keys(parsedContent as Record<string, any>),
        resultPreview: JSON.stringify(parsedContent).substring(0, 100) + '...'
    };
    runner.emit('promptExecutionResult', executionResultContext);
    runner.logger.debug('[executePrompt] Prompt execution result', executionResultContext);

    // Handle the "then" section based on the prompt's configuration
    const thenSectionResult = await handleThenSection(runner, prompt, parsedContent, context, provider);
    if (thenSectionResult) {
        return thenSectionResult;
    }

    return { result: parsedContent, state: runner.state };
}

export { executePromptWithTimeout } from './executePromptWithTimeout';
