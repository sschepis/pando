import { Config, Provider } from '../types';
import { AIError } from '../../errors';
import axios from 'axios';

export const anthropic = createAnthropicProvider;

export function createAnthropicProvider(config: Config): Provider {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new AIError('ANTHROPIC_API_KEY environment variable is not set');
    }

    const client = axios.create({
        baseURL: 'https://api.anthropic.com/v1',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        }
    });

    return {
        name: 'anthropic',
        url: 'https://api.anthropic.com/v1',
        path: '/messages',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        },
        model: 'claude-2',
        client,
        requestObject: {
            getMessage: (message: any) => ({
                role: message.role === 'user' ? 'user' : 'assistant',
                content: typeof message === 'string' ? message : message.content
            }),
            getOptions: (options: any) => ({
                model: options.model || 'claude-2',
                max_tokens: options.max_tokens || 2000,
                temperature: options.temperature || 0.7,
                ...options
            })
        },
        responseFormat: {
            getContent: (response: any) => {
                try {
                    if (!response?.content?.[0]?.text) {
                        throw new AIError('Invalid response format from Anthropic');
                    }
                    return response.content[0].text;
                } catch (error: unknown) {
                    throw new AIError(
                        `Error getting content from Anthropic response: ${error instanceof Error ? error.message : String(error)}`,
                        error
                    );
                }
            },
            getToolCall: (response: any) => {
                try {
                    // Anthropic's tool calls are embedded in the content
                    const content = response?.content?.[0]?.text;
                    if (!content) return undefined;

                    // Try to extract tool calls from the content
                    const toolCallMatch = content.match(/\{[\s\S]*?\}/g);
                    if (!toolCallMatch) return undefined;

                    return toolCallMatch.map(match => {
                        try {
                            const parsed = JSON.parse(match);
                            return {
                                function: {
                                    name: parsed.function || parsed.name,
                                    arguments: typeof parsed.arguments === 'string' ? 
                                        parsed.arguments : 
                                        JSON.stringify(parsed.arguments || parsed.params || {})
                                }
                            };
                        } catch {
                            return null;
                        }
                    }).filter(Boolean);
                } catch (error: unknown) {
                    throw new AIError(
                        `Error getting tool calls from Anthropic response: ${error instanceof Error ? error.message : String(error)}`,
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
