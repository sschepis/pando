import { AxiosInstance } from "axios";

export type Provider = {
    name: string;
    url: string;
    path: string;
    headers: Record<string, string>;
    model?: string;
    client: AxiosInstance;
    requestObject: {
        getMessage: (message: any) => { role: string; content: string | { type: string; text: string } };
        getOptions: (options: any) => Record<string, any>;
    };
    responseFormat: {
        getContent: (response: any) => string | undefined;
        getToolCall?: (response: any) => any;
        getToolName?: (toolCall: any) => string;
        getToolArgs?: (toolCall: any) => any;
    };
    toolFormat: {
        formatTools: (tools: any[]) => any[];
        formatTool?: (tool: any) => any;
    };
    request?: (request: any) => any;
};

export type PromptCondition = string;
export type PromptRoute = {
    prompt?: string;
    function?: string;
    arguments: any;
};
export type PromptConditionalRoutes = Record<PromptCondition, PromptRoute>;

export type Prompt = {
    name: string;
    system: string;
    user: string;
    requestFormat: Record<string, string>;
    responseFormat: Record<string, any>;
    tools?: Array<string | { funcName: (parameters: any, context: any) => any }>;
    then: PromptConditionalRoutes;
    repeat?: boolean;
    maxAttempts?: number;
    timeout?: number;
};

export type Tool = {
    type: string;
    function: {
        name: string;
        description?: string;
        parameters: {
            type: string;
            properties: Record<string, {
                type: string;
                description?: string;
                properties?: Record<string, {
                    type: string;
                    description?: string;
                }>;
            }>;
            required: string[];
        };
        script: (parameters: any, context: any) => Promise<any>;
    };
};

export type Config = {
    provider: Provider;
    fallbackProviders?: Array<Provider>;
    tools: Array<Tool>;
    prompts: Array<Prompt>;
};

export interface RunnerOptions {
    maxDepth?: number;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    defaultProvider?: string;
    cycleProviders?: boolean;
    state?: Record<string, any>;
}

export interface CLIConfig {
    assistant: any;
    options: RunnerOptions;
}
