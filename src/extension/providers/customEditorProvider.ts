import * as vscode from 'vscode';
import { AIAssistantEditorProvider } from '../../customEditor';

export function registerCustomEditorProvider(context: vscode.ExtensionContext) {
    return AIAssistantEditorProvider.register(context);
}
