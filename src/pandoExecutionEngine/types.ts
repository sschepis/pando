import { AIAssistant } from '../ai/AIAssistant';

export interface PandoContext {
    variables: { [key: string]: any };
    tools: { [key: string]: Function };
}

export interface PandoPrompt {
    name: string;
    systemPrompt: string;
    userPrompt: string;
    input: { [key: string]: string };
    output: { [key: string]: string };
    tools: { [key: string]: Function };
    conditions: { [key: string]: string };
    actions: { [key: string]: string };
    [key: string]: any; // Add index signature
}

export interface PandoExecutionEngineOptions {
    aiAssistant: AIAssistant;
}

export interface PandoState {
    variables: { [key: string]: any };
    executionCount: number;
}
