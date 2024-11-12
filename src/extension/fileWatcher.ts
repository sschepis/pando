import * as vscode from 'vscode';
import { PandoVSCodeBridge } from '../pandoVSCodeBridge';

export function setupPandoFileWatcher(context: vscode.ExtensionContext, pandoVSCodeBridge: PandoVSCodeBridge, logger: any) {
    const pandoWatcher = vscode.workspace.createFileSystemWatcher('**/*.pando');

    pandoWatcher.onDidChange(async (uri) => {
        const document = await vscode.workspace.openTextDocument(uri);
        executePandoFile(document, pandoVSCodeBridge, logger);
    });

    pandoWatcher.onDidCreate(async (uri) => {
        const document = await vscode.workspace.openTextDocument(uri);
        executePandoFile(document, pandoVSCodeBridge, logger);
    });

    context.subscriptions.push(pandoWatcher);
}

async function executePandoFile(document: vscode.TextDocument, pandoVSCodeBridge: PandoVSCodeBridge, logger: any) {
    if (document.languageId === 'pando') {
        const fileContent = document.getText();
        try {
            const result = await pandoVSCodeBridge.executePandoFile(fileContent);
            vscode.window.showInformationMessage(`Pando file executed successfully: ${JSON.stringify(result)}`);
            logger.info(`Pando file executed successfully: ${JSON.stringify(result)}`);
        } catch (error) {
            const errorMessage = `Error executing Pando file: ${error}`;
            vscode.window.showErrorMessage(errorMessage);
            logger.error(errorMessage);
        }
    }
}
