import * as vscode from 'vscode';

export class PandoHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position);
        const word = document.getText(range);

        switch (word) {
            case 'prompt':
                return new vscode.Hover('Defines a prompt for the AI assistant.');
            case 'input':
                return new vscode.Hover('Specifies the input format for the prompt.');
            case 'output':
                return new vscode.Hover('Specifies the output format for the prompt.');
            case 'tool':
                return new vscode.Hover('Defines a tool that can be used by the AI assistant.');
            case 'condition':
                return new vscode.Hover('Specifies a condition for executing an action.');
            case 'action':
                return new vscode.Hover('Defines an action to be taken by the AI assistant.');
            default:
                return null;
        }
    }
}
