import { Config, Provider } from '../types';
import axios from 'axios';

const authData = {
    url: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
    path: `${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2023-05-15`,
    headers: {
        "api-key": process.env.AZURE_OPENAI_API_KEY || '',
        "Content-Type": "application/json"
    },
}

export const azure: Provider = {
    name: "azure",
    model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    ...authData,
    requestObject: {
        getMessage: (message: any) => ({ role: message.role, content: message.content }),
        getOptions: (options: any) => ({
            max_tokens: options.maxTokens,
            temperature: options.temperature,
            stream: options.stream
        }),
    },
    client: axios.create({
        baseURL: authData.url,
        headers: authData.headers
    }),
    request: (request: any) => {
        // specify that we want json format as a response
        request.response_format = { type: "json_object" };
        return request;
    },
    toolFormat: {
        formatTools: (tools: any) => tools.map((tool: any) => {
            return tool && tool.getOpenAISchema()
        }).filter((tool: any) => tool !== undefined),
    },
    responseFormat: {
        getContent: (response: any) => response.choices[0].message.content,
        getToolCall: (response: any) => response.choices[0].message.function_call,
    },
};
