import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

export class VersionControlManager {
    private readonly gitPath: string;

    constructor() {
        this.gitPath = this.findGitPath();
    }

    private findGitPath(): string {
        try {
            const gitPath = cp.execSync('which git', { encoding: 'utf8' }).trim();
            return gitPath;
        } catch (error) {
            vscode.window.showErrorMessage('Git is not installed or not in the system PATH.');
            return '';
        }
    }

    public async initializeRepository(projectPath: string): Promise<void> {
        if (!this.gitPath) {
            vscode.window.showErrorMessage('Git is not available. Unable to initialize repository.');
            return;
        }

        try {
            await this.executeCommand(projectPath, 'init');
            await this.executeCommand(projectPath, 'add', '.');
            await this.executeCommand(projectPath, 'commit', '-m', '"Initial commit"');
            vscode.window.showInformationMessage('Git repository initialized successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize Git repository: ${error}`);
        }
    }

    public async createBranch(projectPath: string, branchName: string): Promise<void> {
        try {
            await this.executeCommand(projectPath, 'checkout', '-b', branchName);
            vscode.window.showInformationMessage(`Branch '${branchName}' created successfully.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create branch: ${error}`);
        }
    }

    public async commitChanges(projectPath: string, message: string): Promise<void> {
        try {
            await this.executeCommand(projectPath, 'add', '.');
            await this.executeCommand(projectPath, 'commit', '-m', message);
            vscode.window.showInformationMessage('Changes committed successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to commit changes: ${error}`);
        }
    }

    private executeCommand(cwd: string, ...args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            cp.execFile(this.gitPath, args, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else if (stderr) {
                    reject(new Error(stderr));
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }
}

export function registerVersionControlCommands(context: vscode.ExtensionContext) {
    const vcManager = new VersionControlManager();

    context.subscriptions.push(
        vscode.commands.registerCommand('pando.initializeRepository', async () => {
            const projectPath = vscode.workspace.rootPath;
            if (projectPath) {
                await vcManager.initializeRepository(projectPath);
            } else {
                vscode.window.showErrorMessage('No workspace folder open.');
            }
        }),

        vscode.commands.registerCommand('pando.createBranch', async () => {
            const projectPath = vscode.workspace.rootPath;
            if (projectPath) {
                const branchName = await vscode.window.showInputBox({ prompt: 'Enter new branch name' });
                if (branchName) {
                    await vcManager.createBranch(projectPath, branchName);
                }
            } else {
                vscode.window.showErrorMessage('No workspace folder open.');
            }
        }),

        vscode.commands.registerCommand('pando.commitChanges', async () => {
            const projectPath = vscode.workspace.rootPath;
            if (projectPath) {
                const message = await vscode.window.showInputBox({ prompt: 'Enter commit message' });
                if (message) {
                    await vcManager.commitChanges(projectPath, message);
                }
            } else {
                vscode.window.showErrorMessage('No workspace folder open.');
            }
        })
    );
}
