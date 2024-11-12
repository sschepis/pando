import * as vscode from 'vscode';
import { AIAssistant } from '../../ai/AIAssistant';
import { AIAssistantTaskProvider } from './aiAssistantTaskProvider';

export function registerTaskProvider(context: vscode.ExtensionContext, aiAssistant: AIAssistant) {
    const taskProvider = new AIAssistantTaskProvider(aiAssistant);
    return vscode.tasks.registerTaskProvider(AIAssistantTaskProvider.taskType, taskProvider);
}
