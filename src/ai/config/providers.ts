import { Config, Provider } from '../types';
import { createOpenAIProvider } from '../providers/openai';
import { createAnthropicProvider } from '../providers/anthropic';

export const defaultProviders = {
    openai: createOpenAIProvider,
    anthropic: createAnthropicProvider
};

export function getDefaultProvider(): string {
    return process.env.PANDO_DEFAULT_PROVIDER || 'openai';
}

export function createProvider(name: string, config: Config): Provider {
    const providerCreator = defaultProviders[name as keyof typeof defaultProviders];
    if (!providerCreator) {
        throw new Error(`Provider ${name} not found`);
    }
    return providerCreator(config);
}

export const providers: Record<string, Provider> = {
    openai: createOpenAIProvider({} as Config),
    anthropic: createAnthropicProvider({} as Config)
};
