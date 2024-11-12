import * as vscode from 'vscode';

export function registerNewFileCommand(
    context: vscode.ExtensionContext,
    logger: any
) {
    return vscode.commands.registerCommand('pando.newFile', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace before creating a Pando file.');
            return;
        }

        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter the name for your new Pando file',
            placeHolder: 'myPrompt.pando'
        });

        if (!fileName) {
            return;
        }

        const filePath = vscode.Uri.joinPath(workspaceFolders[0].uri, fileName.endsWith('.pando') ? fileName : `${fileName}.pando`);

        try {
            await vscode.workspace.fs.writeFile(filePath, Buffer.from('prompt myPrompt {\n\n}\n'));
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
        } catch (error) {
            logger.error(`Error creating new Pando file: ${error}`);
            vscode.window.showErrorMessage(`Error creating new Pando file: ${error}`);
        }
    });
}
