import { Config, Provider } from '../types';
import axios from 'axios';

const authData = {
    url: `https://${process.env.VERTEX_ANTHROPIC_LOCATION}-aiplatform.googleapis.com/v1/`,
    path: `projects/${process.env.VERTEX_PROJECT_ID}/locations/${process.env.VERTEX_ANTHROPIC_LOCATION}/publishers/anthropic/models/${process.env.VERTEX_ANTHROPIC_MODEL}:rawPredict`,
    headers: {
        "Authorization": `Bearer ${process.env.VERTEX_API_KEY}`,
        "Content-Type": "application/json"
    }
}

export const vertexAnthropic: Provider = {
    name: "vertex-anthropic",
    ...authData,
    client: axios.create({
        baseURL: authData.url,
        headers: authData.headers
    }),
    requestObject: {
        getMessage: (message: any) => ({
            role: message.role, content: {
                type: 'text',
                text: message.content
            }
        }),
        getOptions: (options: any) => ({
            anthropic_version: "vertex-2023-10-16",
            max_tokens: options.maxTokens,
            stream: options.stream
        }),
    },
    request: (request: any) => {
        if (request.messages[0].role === 'system') {
            request.system = request.messages[0].content;
            request.messages.shift();
            return request;
        }
        return request;
    },
    toolFormat: {
        formatTools: (tools: any) => tools.map((tool: any) => {
            if (tool && typeof tool === 'object' && tool.type === 'function') {
                return {
                    type: 'function',
                    function: {
                        name: tool.function.name,
                        description: tool.function.description,
                        input_schema: tool.function.parameters
                    }
                };
            }
            return undefined;
        }).filter((tool: any) => tool !== undefined),
    },
    responseFormat: {
        getContent: (response: any) => response.content.find((item: any) => item.type === "text")?.text,
        getToolCall: (response: any) => response.content.find((item: any) => item.type === "tool_use"),
    }
};
