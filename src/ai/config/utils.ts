import { Provider, Prompt, Tool, Config } from "../types";

export const createModuleConfig = (provider: Provider, prompts: Prompt[], tools: Tool[], fallbackProviders?: Provider[]): Config => {
    return {
        provider,
        fallbackProviders,
        prompts,
        tools,
    };
}

export function loadCustomConfigs(configs: Config[]): Config {
    return configs.reduce((acc, config) => {
        return {
            provider: configs[0].provider,
            fallbackProviders: configs[0].fallbackProviders,
            prompts: [...acc.prompts, ...config.prompts],
            tools: [...acc.tools, ...config.tools],
        };
    });
}