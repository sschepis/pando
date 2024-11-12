import * as vscode from 'vscode';
import { activate, deactivate } from './activation';

export function activateExtension(context: vscode.ExtensionContext) {
    activate(context);
}

export function deactivateExtension() {
    deactivate();
}
