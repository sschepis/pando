import * as vscode from 'vscode';
import { Prompt } from './ai/types';

export class PandoCache {
    private cache: Map<string, { prompt: Prompt; timestamp: number }>;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.cache = new Map();
        this.context = context;
        this.loadCache();
    }

    public get(key: string): Prompt | undefined {
        const cached = this.cache.get(key);
        if (cached && this.isValid(cached.timestamp)) {
            return cached.prompt;
        }
        return undefined;
    }

    public set(key: string, prompt: Prompt): void {
        this.cache.set(key, { prompt, timestamp: Date.now() });
        this.saveCache();
    }

    public clear(): void {
        this.cache.clear();
        this.saveCache();
    }

    private isValid(timestamp: number): boolean {
        // Consider cached items valid for 1 hour
        const oneHour = 60 * 60 * 1000;
        return Date.now() - timestamp < oneHour;
    }

    private loadCache(): void {
        const cachedData = this.context.globalState.get<{ [key: string]: { prompt: Prompt; timestamp: number } }>('pandoCache');
        if (cachedData) {
            this.cache = new Map(Object.entries(cachedData));
        }
    }

    private saveCache(): void {
        const cacheObject = Object.fromEntries(this.cache);
        this.context.globalState.update('pandoCache', cacheObject);
    }
}
