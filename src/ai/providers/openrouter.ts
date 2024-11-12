import { Config, Provider } from '../types';
import { AIError } from '../../errors';
import axios from 'axios';

export function createOpenRouterProvider(config: Config): Provider {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new AIError('OPENROUTER_API_KEY environment variable is not set');
    }

    const client = axios.create({
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    return {
        name: 'openrouter',
        url: 'https://openrouter.ai/api/v1',
        path: '/chat/completions',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        model: 'openai/gpt-4',
        client,
        requestObject: {
            getMessage: (message: any) => ({
                role: message.role || 'user',
                content: typeof message === 'string' ? message : message.content
            }),
            getOptions: (options: any) => ({
                model: options.model || 'openai/gpt-4',
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 2000,
                ...options
            })
        },
        responseFormat: {
            getContent: (response: any) => {
                try {
                    if (response.error) {
                        throw new AIError(`OpenRouter API Error: ${response.error.message}`, response.error);
                    }
                    if (!response.choices || response.choices.length === 0) {
                        throw new AIError('OpenRouter API returned an empty response');
                    }
                    return response.choices[0].message.content;
                } catch (error: unknown) {
                    throw new AIError(
                        `Error getting content from OpenRouter response: ${error instanceof Error ? error.message : String(error)}`,
                        error
                    );
                }
            },
            getToolCall: (response: any) => {
                try {
                    if (response.error) {
                        throw new AIError(`OpenRouter API Error: ${response.error.message}`, response.error);
                    }
                    if (!response.choices || response.choices.length === 0) {
                        throw new AIError('OpenRouter API returned an empty response');
                    }
                    return response.choices[0].message.tool_calls;
                } catch (error: unknown) {
                    throw new AIError(
                        `Error getting tool calls from OpenRouter response: ${error instanceof Error ? error.message : String(error)}`,
                        error
                    );
                }
            },
            getToolName: (toolCall: any) => toolCall?.function?.name,
            getToolArgs: (toolCall: any) => {
                try {
                    return JSON.parse(toolCall?.function?.arguments || '{}');
                } catch (error: unknown) {
                    throw new AIError(
                        `Error parsing tool arguments: ${error instanceof Error ? error.message : String(error)}`,
                        error
                    );
                }
            }
        },
        toolFormat: {
            formatTools: (tools: any[]) => tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            })),
            formatTool: (tool: any) => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            })
        }
    };
}
