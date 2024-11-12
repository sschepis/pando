import { Config, Provider } from '../types';
import { createOpenAIProvider } from './openai';
import { createAnthropicProvider } from './anthropic';
import { createOpenRouterProvider } from './openrouter';

export const providers = {
    openai: createOpenAIProvider,
    anthropic: createAnthropicProvider,
    openrouter: createOpenRouterProvider
};

export function getProvider(name: string, config: Config): Provider {
    const provider = providers[name as keyof typeof providers];
    if (!provider) {
        throw new Error(`Provider ${name} not found`);
    }
    return provider(config);
}

export { createOpenAIProvider as openai } from './openai';
export { createAnthropicProvider as anthropic } from './anthropic';
export { createOpenRouterProvider as openrouter } from './openrouter';
