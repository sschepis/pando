import * as vscode from 'vscode';

interface Prompt {
    id: string;
    text: string;
    isFavorite: boolean;
    timestamp: number;
    tags: string[];
}

export class PromptManager {
    private context: vscode.ExtensionContext;
    private prompts: Prompt[] = [];
    private static readonly PROMPTS_KEY = 'aiDashboard.prompts';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadPrompts();
    }

    private loadPrompts() {
        this.prompts = this.context.globalState.get<Prompt[]>(PromptManager.PROMPTS_KEY, []);
    }

    private savePrompts() {
        this.context.globalState.update(PromptManager.PROMPTS_KEY, this.prompts);
    }

    addPrompt(text: string, tags: string[] = []) {
        const prompt: Prompt = {
            id: Date.now().toString(),
            text,
            isFavorite: false,
            timestamp: Date.now(),
            tags
        };
        this.prompts.unshift(prompt);
        this.savePrompts();
    }

    getPrompts() {
        return this.prompts;
    }

    toggleFavorite(id: string) {
        const prompt = this.prompts.find(p => p.id === id);
        if (prompt) {
            prompt.isFavorite = !prompt.isFavorite;
            this.savePrompts();
        }
    }

    deletePrompt(id: string) {
        this.prompts = this.prompts.filter(p => p.id !== id);
        this.savePrompts();
    }

    addTag(id: string, tag: string) {
        const prompt = this.prompts.find(p => p.id === id);
        if (prompt && !prompt.tags.includes(tag)) {
            prompt.tags.push(tag);
            this.savePrompts();
        }
    }

    removeTag(id: string, tag: string) {
        const prompt = this.prompts.find(p => p.id === id);
        if (prompt) {
            prompt.tags = prompt.tags.filter(t => t !== tag);
            this.savePrompts();
        }
    }

    searchPrompts(query: string, tags: string[] = []): Prompt[] {
        return this.prompts.filter(prompt => {
            const matchesQuery = prompt.text.toLowerCase().includes(query.toLowerCase());
            const matchesTags = tags.length === 0 || tags.every(tag => prompt.tags.includes(tag));
            return matchesQuery && matchesTags;
        });
    }

    getPromptsHtml(searchQuery: string = '', searchTags: string[] = []) {
        const filteredPrompts = this.searchPrompts(searchQuery, searchTags);
        return filteredPrompts.map(prompt => `
            <div class="prompt" data-id="${prompt.id}">
                <span class="prompt-text">${prompt.text}</span>
                <div class="prompt-tags">
                    ${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="favorite-btn">${prompt.isFavorite ? '★' : '☆'}</button>
                <button class="delete-btn">🗑</button>
            </div>
        `).join('');
    }
}

export function getPromptManagerWidget(promptManager: PromptManager): string {
    return `
        <div class="widget" id="prompt-manager">
            <div class="widget-header">
                <h3>Prompt Manager</h3>
            </div>
            <div class="widget-content">
                <input type="text" id="prompt-search" placeholder="Search prompts...">
                <input type="text" id="tag-search" placeholder="Search tags (comma-separated)">
                <button id="search-btn">Search</button>
                <div id="prompt-list">
                    ${promptManager.getPromptsHtml()}
                </div>
            </div>
        </div>
    `;
}
