import * as vscode from 'vscode';

export class DebugConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
        // If launch.json is missing or empty
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'pando') {
                config.type = 'pando';
                config.name = 'Launch';
                config.request = 'launch';
                config.program = '${file}';
                config.stopOnEntry = true;
            }
        }

        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined;  // abort launch
            });
        }

        return config;
    }

    provideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration[]> {
        return [
            {
                name: "Pando Debug",
                type: "pando",
                request: "launch",
                program: "${file}",
                stopOnEntry: true
            },
            {
                name: "Pando Attach",
                type: "pando",
                request: "attach",
                processId: "${command:pickProcess}"
            }
        ];
    }
}

export function registerDebugConfigurationProvider(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider('pando', new DebugConfigurationProvider())
    );
}
