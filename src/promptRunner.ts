import * as vscode from 'vscode';

export class PromptRunner {
    async runCurrentPrompt(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const text = document.getText();
            try {
                const result = await this.runPrompt(text);
                vscode.window.showInformationMessage(`Prompt result: ${result}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error running prompt: ${error}`);
            }
        }
    }

    async runPrompt(promptText: string): Promise<string> {
        // Implement the logic to run the prompt
        // This is where you'd integrate with your Pando system
        return `Result of running prompt: ${promptText}`;
    }
}
