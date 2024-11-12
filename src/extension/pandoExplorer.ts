import * as vscode from 'vscode';
import * as path from 'path';

class PandoFileSystemProvider implements vscode.TreeDataProvider<PandoFile> {
    private _onDidChangeTreeData: vscode.EventEmitter<PandoFile | undefined | null | void> = new vscode.EventEmitter<PandoFile | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PandoFile | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string | undefined) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PandoFile): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PandoFile): Thenable<PandoFile[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No Pando files in empty workspace');
            return Promise.resolve([]);
        }

        if (element) {
            return Promise.resolve(this.getPandoFiles(path.join(this.workspaceRoot, element.label)));
        } else {
            return Promise.resolve(this.getPandoFiles(this.workspaceRoot));
        }
    }

    private getPandoFiles(dir: string): PandoFile[] {
        const pandoFiles: PandoFile[] = [];
        const files = vscode.workspace.fs.readDirectory(vscode.Uri.file(dir));
        files.then((fileArray) => {
            fileArray.forEach(([file, type]) => {
                if (type === vscode.FileType.Directory) {
                    pandoFiles.push(new PandoFile(file, vscode.TreeItemCollapsibleState.Collapsed));
                } else if (path.extname(file) === '.pando') {
                    pandoFiles.push(new PandoFile(file, vscode.TreeItemCollapsibleState.None, {
                        command: 'vscode.open',
                        title: 'Open File',
                        arguments: [vscode.Uri.file(path.join(dir, file))]
                    }));
                }
            });
        });
        return pandoFiles;
    }
}

class PandoFile extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.description = path.join('Pando Files', this.label);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'pando.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'pando.svg')
    };

    contextValue = 'pandoFile';
}

export function registerPandoExplorer(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

    const pandoFileSystemProvider = new PandoFileSystemProvider(rootPath);
    vscode.window.registerTreeDataProvider('pandoFiles', pandoFileSystemProvider);

    vscode.commands.registerCommand('pandoExplorer.refreshEntry', () => pandoFileSystemProvider.refresh());
}
