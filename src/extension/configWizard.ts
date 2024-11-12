import * as vscode from 'vscode';

export class ConfigurationWizard {
    constructor(private context: vscode.ExtensionContext) {}

    public async show() {
        const result = await vscode.window.showQuickPick(
            [
                { label: 'Default Provider', description: 'Set the default AI provider' },
                { label: 'API Key', description: 'Set the API key for the selected provider' },
                { label: 'Model', description: 'Set the AI model to use' },
                { label: 'Advanced Settings', description: 'Configure advanced options' }
            ],
            {
                placeHolder: 'Select a configuration option'
            }
        );

        if (result) {
            switch (result.label) {
                case 'Default Provider':
                    await this.configureDefaultProvider();
                    break;
                case 'API Key':
                    await this.configureApiKey();
                    break;
                case 'Model':
                    await this.configureModel();
                    break;
                case 'Advanced Settings':
                    await this.configureAdvancedSettings();
                    break;
            }
        }
    }

    private async configureDefaultProvider() {
        const provider = await vscode.window.showQuickPick(
            ['OpenAI', 'Anthropic', 'Azure'],
            { placeHolder: 'Select the default AI provider' }
        );
        if (provider) {
            await vscode.workspace.getConfiguration('pando').update('defaultProvider', provider, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Default provider set to ${provider}`);
        }
    }

    private async configureApiKey() {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter the API key for the selected provider',
            password: true
        });
        if (apiKey) {
            await this.context.secrets.store('pando.apiKey', apiKey);
            vscode.window.showInformationMessage('API key has been securely stored');
        }
    }

    private async configureModel() {
        const model = await vscode.window.showQuickPick(
            ['gpt-3.5-turbo', 'gpt-4', 'claude-v1'],
            { placeHolder: 'Select the AI model to use' }
        );
        if (model) {
            await vscode.workspace.getConfiguration('pando').update('model', model, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Model set to ${model}`);
        }
    }

    private async configureAdvancedSettings() {
        // Implement advanced settings configuration
        vscode.window.showInformationMessage('Advanced settings configuration not yet implemented');
    }
}

export function registerConfigWizard(context: vscode.ExtensionContext) {
    const wizard = new ConfigurationWizard(context);
    const disposable = vscode.commands.registerCommand('pando.showConfigWizard', () => {
        wizard.show();
    });
    context.subscriptions.push(disposable);
}
