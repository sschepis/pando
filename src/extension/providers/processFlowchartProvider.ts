import * as vscode from 'vscode';
import * as path from 'path';

export class ProcessFlowchartProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new ProcessFlowchartProvider(context);
        return vscode.window.registerCustomEditorProvider(ProcessFlowchartProvider.viewType, provider);
    }

    private static readonly viewType = 'pando.processFlowchart';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        this.setupWebview(webviewPanel, document);
        this.setupUpdateListener(webviewPanel, document);
    }

    private setupWebview(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument): void {
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document.uri);
    }

    private setupUpdateListener(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument): void {
        const updateWebview = () => {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        };

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview, uri: vscode.Uri): string {
        const scriptUri = this.getWebviewUri(webview, 'media', 'processFlowchart.js');
        const styleUri = this.getWebviewUri(webview, 'media', 'processFlowchart.css');
        const nonce = this.getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet" />
                <title>Process Flowchart</title>
            </head>
            <body>
                <div id="flowchart"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    private getWebviewUri(webview: vscode.Webview, ...pathSegments: string[]): vscode.Uri {
        return webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, ...pathSegments)
        ));
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
