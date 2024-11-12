import { Config, Provider } from '../types';
import { tools } from './tools';
import axios from 'axios';

const provider: Provider = {
    name: 'openai',
    url: 'https://api.openai.com',
    path: '/v1/chat/completions',
    headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
        'Content-Type': 'application/json'
    },
    model: 'gpt-3.5-turbo',
    client: axios.create({
        baseURL: 'https://api.openai.com',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
            'Content-Type': 'application/json'
        }
    }),
    requestObject: {
        getMessage: (message: any) => ({ role: message.role, content: message.content }),
        getOptions: (options: any) => ({ model: options.model || 'gpt-3.5-turbo' })
    },
    responseFormat: {
        getContent: (response: any) => response.choices[0].message.content
    },
    toolFormat: {
        formatTools: (tools: any[]) => tools
    }
};

export const defaultConfig: Config = {
    prompts: [
        {
            name: 'main',
            system: 'You are an AI assistant. How can I help you today?',
            user: '{query}',
            requestFormat: {},
            responseFormat: { type: 'text' },
            then: {}
        }
    ],
    tools: tools,
    provider: provider
};
