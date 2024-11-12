import * as vscode from 'vscode';
import * as path from 'path';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activateLanguageServer(context: vscode.ExtensionContext) {
    const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'pando' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.pando')
        }
    };

    client = new LanguageClient(
        'pandoLanguageServer',
        'Pando Language Server',
        serverOptions,
        clientOptions
    );

    client.start();
}

export function deactivateLanguageServer() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
