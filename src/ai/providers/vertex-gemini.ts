import { Config, Provider } from '../types';
import axios from 'axios';

const authData = {
    url: `https://us-central1-aiplatform.googleapis.com/v1/`,
    path: `projects/silent-blade-417120/locations/us-central1/publishers/google/models/gemini-1.5-pro-002:generateContent`,
    headers: {
        "Authorization": `Bearer ${process.env.VERTEX_API_KEY}`,
        "Content-Type": "application/json"
    }
}

export const vertexGemini: Provider = {
    ...authData,
    name: "vertex-gemini",
    model: process.env.VERTEX_GEMINI_MODEL || 'gemini-1.5-pro-002',
    requestObject: {
        getMessage: (message: any) => ({ role: message.role, content: message.content }),
        getOptions: (options: any) => ({}),
    },
    client: axios.create({
        baseURL: authData.url,
        headers: authData.headers
    }),
    request: (request: any) => {
        request.tool_config = {
            "function_calling_config": {
                "mode": "ANY"
            },
        }
        request.contents = request.messages.map((message: any) => (
            {
                "role": message.role,
                "parts": [
                    {
                        "text": message.content
                    }
                ]
            }
        ));
        request.generationConfig = {
            "temperature": 1
            , "maxOutputTokens": 8192
            , "topP": 0.95
            , "seed": 0
        };
        request.safetySettings = [
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "OFF"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "OFF"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "OFF"
            },
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "OFF"
            }
        ]
        delete request.messages;
        return request;
    },
    toolFormat: {
        formatTools: (tools: any) => ([{
            function_declarations: tools.map((tool: any) => {
                return tool && tool.getOpenAISchema()
            }).filter((tool: any) => tool !== undefined)
        }]),
    },
    responseFormat: {
        getContent: (response: any) => response.candidates[0].content.parts[0].text,
        getToolCall: (response: any) => response.candidates[0].content.parts[0].functionCall,
    }
};
