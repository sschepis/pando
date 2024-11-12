import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function registerFileManagementCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('pando.batchRename', batchRename),
        vscode.commands.registerCommand('pando.batchMove', batchMove),
        vscode.commands.registerCommand('pando.batchDelete', batchDelete)
    );
}

async function batchRename() {
    const files = await selectPandoFiles();
    if (!files || files.length === 0) return;

    const prefix = await vscode.window.showInputBox({ prompt: 'Enter prefix for renamed files' });
    if (!prefix) return;

    for (const file of files) {
        const oldPath = file.fsPath;
        const dirName = path.dirname(oldPath);
        const oldName = path.basename(oldPath);
        const newName = `${prefix}_${oldName}`;
        const newPath = path.join(dirName, newName);

        fs.renameSync(oldPath, newPath);
    }

    vscode.window.showInformationMessage(`Renamed ${files.length} files`);
}

async function batchMove() {
    const files = await selectPandoFiles();
    if (!files || files.length === 0) return;

    const targetFolder = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select target folder'
    });

    if (!targetFolder || targetFolder.length === 0) return;

    for (const file of files) {
        const oldPath = file.fsPath;
        const fileName = path.basename(oldPath);
        const newPath = path.join(targetFolder[0].fsPath, fileName);

        fs.renameSync(oldPath, newPath);
    }

    vscode.window.showInformationMessage(`Moved ${files.length} files`);
}

async function batchDelete() {
    const files = await selectPandoFiles();
    if (!files || files.length === 0) return;

    const confirmation = await vscode.window.showWarningMessage(
        `Are you sure you want to delete ${files.length} files?`,
        'Yes',
        'No'
    );

    if (confirmation !== 'Yes') return;

    for (const file of files) {
        fs.unlinkSync(file.fsPath);
    }

    vscode.window.showInformationMessage(`Deleted ${files.length} files`);
}

async function selectPandoFiles(): Promise<vscode.Uri[] | undefined> {
    return vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
        filters: {
            'Pando Files': ['pando']
        },
        openLabel: 'Select Pando files'
    });
}
