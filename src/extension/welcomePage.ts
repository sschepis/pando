import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PandoVSCodeBridge } from '../pandoVSCodeBridge';

export function registerWelcomePage(context: vscode.ExtensionContext, logger: any, pandoVSCodeBridge: PandoVSCodeBridge) {
    const command = vscode.commands.registerCommand('pando.showWelcomePage', () => {
        showWelcomePage(context, logger, pandoVSCodeBridge);
    });
    context.subscriptions.push(command);
}

function showWelcomePage(context: vscode.ExtensionContext, logger: any, pandoVSCodeBridge: PandoVSCodeBridge) {
    const panel = vscode.window.createWebviewPanel(
        'pandoWelcome',
        'Welcome to Pando',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))]
        }
    );

    const htmlPath = path.join(context.extensionPath, 'src', 'welcome.html');
    const cssPath = path.join(context.extensionPath, 'src', 'welcome.css');
    const jsPath = path.join(context.extensionPath, 'src', 'welcome.js');

    const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(cssPath));
    const jsUri = panel.webview.asWebviewUri(vscode.Uri.file(jsPath));

    try {
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        const jsContent = fs.readFileSync(jsPath, 'utf8');

        const nonce = getNonce();

        htmlContent = htmlContent
            .replace('${cssUri}', cssUri.toString())
            .replace('${jsUri}', jsUri.toString())
            .replace('${nonce}', nonce);

        panel.webview.html = htmlContent;

        logger.info('Welcome page loaded successfully');
    } catch (error) {
        const errorMessage = `Failed to load welcome page content: ${error}`;
        logger.error(errorMessage);
        panel.webview.html = `<h1>Welcome to Pando</h1><p>Error loading welcome page content: ${error}</p>`;
    }

    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'setShowWelcomePage':
                    context.globalState.update('pandoShowWelcomePage', message.value);
                    logger.info(`Updated show welcome page setting: ${message.value}`);
                    return;
                case 'executePandoPrompt':
                    panel.webview.postMessage({ command: 'pandoPromptExecutionStart' });
                    try {
                        const result = await pandoVSCodeBridge.executePandoFile(message.prompt);
                        panel.webview.postMessage({ 
                            command: 'pandoPromptResult', 
                            result: JSON.stringify(result),
                            status: 'success'
                        });
                        logger.info(`Executed Pando prompt successfully: ${message.prompt}`);
                    } catch (error) {
                        let errorMessage = 'An unknown error occurred';
                        if (error instanceof Error) {
                            errorMessage = error.message;
                        } else if (typeof error === 'string') {
                            errorMessage = error;
                        }
                        panel.webview.postMessage({ 
                            command: 'pandoPromptResult', 
                            result: `Error: ${errorMessage}`,
                            status: 'error'
                        });
                        logger.error(`Error executing Pando prompt: ${errorMessage}`);
                    }
                    return;
            }
        },
        undefined,
        context.subscriptions
    );
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
