import * as vscode from 'vscode';
import { activateLanguageServer, deactivateLanguageServer } from './languageServer/client';
import { PandoCompletionProvider } from './languageServer/providers/completionProvider';
import { PandoHoverProvider } from './languageServer/providers/hoverProvider';
import { PandoDocumentSymbolProvider } from './languageServer/providers/documentSymbolProvider';
import { PandoDocumentFormattingProvider } from './languageServer/providers/formattingProvider';
import { PandoDiagnosticsProvider } from './languageServer/providers/diagnosticsProvider';

export function activate(context: vscode.ExtensionContext) {
    // Activate the language server
    activateLanguageServer(context);

    const diagnosticsProvider = new PandoDiagnosticsProvider();

    // Register providers
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider('pando', new PandoCompletionProvider()),
        vscode.languages.registerHoverProvider('pando', new PandoHoverProvider()),
        vscode.languages.registerDocumentSymbolProvider('pando', new PandoDocumentSymbolProvider()),
        vscode.languages.registerDocumentFormattingEditProvider('pando', new PandoDocumentFormattingProvider())
    );

    // Register event listeners for diagnostics
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'pando') {
                diagnosticsProvider.updateDiagnostics(event.document);
            }
        }),
        vscode.workspace.onDidCloseTextDocument(doc => {
            if (doc.languageId === 'pando') {
                diagnosticsProvider.clearDiagnostics();
            }
        })
    );

    // Run diagnostics on all open Pando documents
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'pando') {
            diagnosticsProvider.updateDiagnostics(doc);
        }
    });
}

export function deactivate() {
    return deactivateLanguageServer();
}
