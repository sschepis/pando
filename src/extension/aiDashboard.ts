import * as vscode from 'vscode';
import { AIAssistant } from '../ai/AIAssistant';
import { AIDashboardState, PerformanceMetrics, Widget } from './aiDashboard/types';
import { getWebviewContent } from './aiDashboard/webviewContent';
import { handleMessage } from './aiDashboard/messageHandler';
import { PromptManager, getPromptManagerWidget } from './aiDashboard/promptManager';

export class AIDashboard {
    private state: AIDashboardState;
    private promptManager: PromptManager;

    constructor(private context: vscode.ExtensionContext, private aiAssistant: AIAssistant) {
        this.promptManager = new PromptManager(context);
        this.state = {
            performanceMetrics: {
                averageResponseTime: 0,
                totalQueries: 0,
                successRate: 100
            },
            widgets: [
                { id: 'metrics', title: 'Performance Metrics', content: '' },
                { id: 'history', title: 'Query History', content: '' },
                { id: 'suggestions', title: 'AI Suggestions', content: '' },
                { id: 'promptManager', title: 'Prompt Manager', content: getPromptManagerWidget(this.promptManager) }
            ],
            panel: undefined
        };
    }

    public show() {
        if (this.state.panel) {
            this.state.panel.reveal();
        } else {
            this.state.panel = vscode.window.createWebviewPanel(
                'aiDashboard',
                'AI Assistant Dashboard',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            this.state.panel.webview.html = getWebviewContent(this.state.widgets);

            this.state.panel.onDidDispose(() => {
                this.state.panel = undefined;
            }, null, this.context.subscriptions);

            this.setupMessageHandling();
        }
    }

    private setupMessageHandling() {
        this.state.panel!.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'addPrompt':
                        this.promptManager.addPrompt(message.text, message.tags);
                        this.updatePromptManagerWidget();
                        break;
                    case 'toggleFavorite':
                        this.promptManager.toggleFavorite(message.id);
                        this.updatePromptManagerWidget();
                        break;
                    case 'deletePrompt':
                        this.promptManager.deletePrompt(message.id);
                        this.updatePromptManagerWidget();
                        break;
                    case 'addTag':
                        this.promptManager.addTag(message.id, message.tag);
                        this.updatePromptManagerWidget();
                        break;
                    case 'removeTag':
                        this.promptManager.removeTag(message.id, message.tag);
                        this.updatePromptManagerWidget();
                        break;
                    case 'searchPrompts':
                        this.updatePromptManagerWidget(message.query, message.tags);
                        break;
                    default:
                        this.state = await handleMessage(message, this.state, this.aiAssistant);
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private updatePromptManagerWidget(searchQuery: string = '', searchTags: string[] = []) {
        const updatedContent = getPromptManagerWidget(this.promptManager);
        this.state.panel!.webview.postMessage({
            command: 'updateWidget',
            id: 'promptManager',
            content: updatedContent,
            promptsHtml: this.promptManager.getPromptsHtml(searchQuery, searchTags)
        });
    }
}

export function registerAIDashboardCommand(context: vscode.ExtensionContext, aiAssistant: AIAssistant) {
    const dashboard = new AIDashboard(context, aiAssistant);

    context.subscriptions.push(
        vscode.commands.registerCommand('pando.showAIDashboard', () => {
            dashboard.show();
        })
    );
}
