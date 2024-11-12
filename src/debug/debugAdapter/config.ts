import { Config } from '../../ai/types';
import axios from 'axios';

export function getDefaultConfig(): Config {
    return {
        provider: {
            name: 'openai',
            url: 'https://api.openai.com',
            path: '/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            model: 'gpt-3.5-turbo',
            client: axios.create({
                baseURL: 'https://api.openai.com',
            }),
            requestObject: {
                getMessage: (message: any) => ({ role: 'user', content: message }),
                getOptions: (options: any) => ({}),
            },
            responseFormat: {
                getContent: (response: any) => response.choices[0].message.content,
            },
            toolFormat: {
                formatTools: (tools: any[]) => tools,
            },
        },
        tools: [],
        prompts: [],
    };
}
 