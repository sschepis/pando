import * as vscode from 'vscode';
import { PandoDebugSession } from './debugAdapter/PandoDebugSession';

export class AIAssistantDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new PandoDebugSession());
    }
}
