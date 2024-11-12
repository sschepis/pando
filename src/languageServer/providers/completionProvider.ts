import * as vscode from 'vscode';
import { LanguageServerError } from '../../errors';

export class PandoCompletionProvider implements vscode.CompletionItemProvider {
    private readonly keywords = [
        'system:', 'user:', 'assistant:', 'function:', 'tools:', 'then:',
        'if:', 'else:', 'repeat:', 'timeout:', 'maxAttempts:'
    ];

    private readonly snippets = {
        'system': {
            prefix: 'system:',
            body: 'system:\n  ${1:System message here}\n',
            description: 'Add a system message section'
        },
        'user': {
            prefix: 'user:',
            body: 'user:\n  ${1:User message here}\n',
            description: 'Add a user message section'
        },
        'function': {
            prefix: 'function:',
            body: 'function:\n  name: ${1:functionName}\n  description: ${2:description}\n  parameters:\n    ${3:parameters}\n',
            description: 'Add a function definition'
        }
    };

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.CompletionItem[]> {
        try {
            const linePrefix = document.lineAt(position.line).text.substr(0, position.character);
            const completions: vscode.CompletionItem[] = [];

            // Add keyword completions
            this.keywords.forEach(keyword => {
                if (keyword.startsWith(linePrefix.trim())) {
                    const completion = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                    completion.sortText = '0' + keyword; // Ensure keywords appear first
                    completions.push(completion);
                }
            });

            // Add snippet completions
            Object.entries(this.snippets).forEach(([key, snippet]) => {
                if (snippet.prefix.startsWith(linePrefix.trim())) {
                    const completion = new vscode.CompletionItem(key, vscode.CompletionItemKind.Snippet);
                    completion.insertText = new vscode.SnippetString(snippet.body);
                    completion.documentation = new vscode.MarkdownString(snippet.description);
                    completion.sortText = '1' + key; // Ensure snippets appear after keywords
                    completions.push(completion);
                }
            });

            // Add context-aware completions
            const contextCompletions = await this.getContextAwareCompletions(document, position);
            completions.push(...contextCompletions);

            return completions;
        } catch (error: unknown) {
            throw new LanguageServerError(
                `Error providing completions: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    private async getContextAwareCompletions(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.CompletionItem[]> {
        try {
            const completions: vscode.CompletionItem[] = [];
            const text = document.getText();
            const currentLine = document.lineAt(position.line).text;

            // Add tool suggestions if we're in a tools section
            if (text.includes('tools:')) {
                const toolNames = await this.getAvailableTools();
                toolNames.forEach(tool => {
                    const completion = new vscode.CompletionItem(tool, vscode.CompletionItemKind.Function);
                    completion.sortText = '2' + tool; // Ensure tools appear after snippets
                    completions.push(completion);
                });
            }

            // Add variable suggestions if we're in a function section
            if (text.includes('function:')) {
                const variables = this.extractVariables(text);
                variables.forEach(variable => {
                    const completion = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable);
                    completion.sortText = '3' + variable; // Ensure variables appear after tools
                    completions.push(completion);
                });
            }

            return completions;
        } catch (error: unknown) {
            throw new LanguageServerError(
                `Error getting context-aware completions: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    private async getAvailableTools(): Promise<string[]> {
        try {
            // This would typically come from a tool registry or configuration
            return [
                'executeCommand',
                'readFile',
                'writeFile',
                'searchFiles',
                'listFiles'
            ];
        } catch (error: unknown) {
            throw new LanguageServerError(
                `Error getting available tools: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    private extractVariables(text: string): string[] {
        try {
            const variables = new Set<string>();
            const variableRegex = /\$\{([^}]+)\}/g;
            let match;

            while ((match = variableRegex.exec(text)) !== null) {
                variables.add(match[1]);
            }

            return Array.from(variables);
        } catch (error: unknown) {
            throw new LanguageServerError(
                `Error extracting variables: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }
}
