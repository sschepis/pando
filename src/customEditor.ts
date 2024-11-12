import * as vscode from 'vscode';
import * as path from 'path';

export class AIAssistantEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new AIAssistantEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(AIAssistantEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'pando.customEditor';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'edit':
                    this.updateTextDocument(document, e.text);
                    return;
            }
        });

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'customEditor.js')
        ));

        const styleUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'customEditor.css')
        ));

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet" />
                <title>Pando Custom Editor</title>
            </head>
            <body>
                <div id="editor"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    private updateTextDocument(document: vscode.TextDocument, text: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text
        );
        return vscode.workspace.applyEdit(edit);
    }
}

// Declare the missing types if they're not available in the vscode types
declare module 'vscode' {
    export interface CustomTextEditorProvider {
        resolveCustomTextEditor(document: TextDocument, webviewPanel: WebviewPanel, token: CancellationToken): Thenable<void> | void;
    }

    export namespace window {
        export function registerCustomEditorProvider(viewType: string, provider: CustomTextEditorProvider, options?: {
            webviewOptions?: {
                retainContextWhenHidden?: boolean;
            };
            supportsMultipleEditorsPerDocument?: boolean;
        }): Disposable;
    }

    export interface Webview {
        asWebviewUri(localResource: Uri): Uri;
    }
}
