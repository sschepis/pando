import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileOrganizer {
    private static readonly ORGANIZED_FOLDER = 'organized_pando_files';

    static async organizeFiles(context: vscode.ExtensionContext) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const pandoFiles = await vscode.workspace.findFiles('**/*.pando');
        const organizedFolder = path.join(workspaceFolders[0].uri.fsPath, this.ORGANIZED_FOLDER);

        if (!fs.existsSync(organizedFolder)) {
            fs.mkdirSync(organizedFolder);
        }

        for (const file of pandoFiles) {
            await this.organizeFile(file, organizedFolder);
        }

        vscode.window.showInformationMessage('Pando files organized successfully');
    }

    private static async organizeFile(file: vscode.Uri, organizedFolder: string) {
        const content = await vscode.workspace.fs.readFile(file);
        const fileContent = content.toString();

        const category = this.determineCategory(fileContent);
        const categoryFolder = path.join(organizedFolder, category);

        if (!fs.existsSync(categoryFolder)) {
            fs.mkdirSync(categoryFolder);
        }

        const fileName = path.basename(file.fsPath);
        const newFilePath = path.join(categoryFolder, fileName);

        await vscode.workspace.fs.copy(file, vscode.Uri.file(newFilePath), { overwrite: true });
    }

    private static determineCategory(fileContent: string): string {
        // This is a simple example. In a real-world scenario, you might use more sophisticated
        // techniques like natural language processing or machine learning to categorize files.
        if (fileContent.includes('function') || fileContent.includes('class')) {
            return 'code';
        } else if (fileContent.includes('test') || fileContent.includes('assert')) {
            return 'tests';
        } else if (fileContent.includes('config') || fileContent.includes('setting')) {
            return 'configuration';
        } else {
            return 'misc';
        }
    }
}

export function registerFileOrganizerCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('pando.organizeFiles', () => FileOrganizer.organizeFiles(context))
    );
}
