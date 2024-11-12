import * as vscode from 'vscode';
import { loadCustomConfigs } from '../ai/config/utils';
import { Config } from '../ai/types';
import { providers } from '../ai/providers';
import base from '../ai/config/base';
import softwareDeveloper from '../ai/config/software-developer';

function getDefaultProvider(): string {
    return vscode.workspace.getConfiguration('pando').get('defaultProvider') || 'openai';
}

function validateProvider(providerName: string): void {
    if (!(providerName in providers)) {
        throw new Error(`Default provider "${providerName}" not found`);
    }
}

function getConfigs(defaultProvider: any): Config[] {
    return [
        base(defaultProvider),
        softwareDeveloper(defaultProvider)
    ];
}

export function loadConfiguration(): Config {
    const defaultProviderName = getDefaultProvider();
    validateProvider(defaultProviderName);
    const defaultProvider = (providers as any)[defaultProviderName];
    const configs = getConfigs(defaultProvider);
    return loadCustomConfigs(configs) as Config;
}
