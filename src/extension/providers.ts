import * as vscode from 'vscode';
import { AIAssistantDebugAdapterDescriptorFactory } from '../debug/factory';
import { AIAssistant } from '../ai/AIAssistant';
import { registerCustomEditorProvider } from './providers/customEditorProvider';
import { registerTaskProvider } from './providers/taskProvider';
import { ProcessFlowchartProvider } from './providers/processFlowchartProvider';

export function registerProviders(context: vscode.ExtensionContext, aiAssistant: AIAssistant) {
    // Register debug adapter descriptor factory
    const factory = new AIAssistantDebugAdapterDescriptorFactory();
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('pando', factory));

    // Register custom editor provider
    context.subscriptions.push(registerCustomEditorProvider(context));

    // Register task provider
    context.subscriptions.push(registerTaskProvider(context, aiAssistant));

    // Register process flowchart provider
    context.subscriptions.push(ProcessFlowchartProvider.register(context));
}
