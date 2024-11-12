import * as vscode from 'vscode';
import { AIAssistant } from '../../ai/AIAssistant';

export function registerInteractWithAICommand(
    context: vscode.ExtensionContext,
    aiAssistant: AIAssistant,
    logger: any
) {
    return vscode.commands.registerCommand('pando.interactWithAI', async () => {
        const editor = vscode.window.activeTextEditor;
        let context = '';

        if (editor) {
            const selection = editor.selection;
            context = editor.document.getText(selection);
        }

        const userInput = await vscode.window.showInputBox({
            prompt: 'Enter your question or request for the AI',
            placeHolder: 'How can I improve this code?'
        });

        if (!userInput) {
            return;
        }

        try {
            // Combine user input and context into a single query
            const query = context ? `Context: ${context}\n\nQuery: ${userInput}` : userInput;
            const response = await aiAssistant.processQuery(query);
            const outputChannel = vscode.window.createOutputChannel('Pando AI Interaction');
            outputChannel.appendLine('User: ' + userInput);
            outputChannel.appendLine('AI: ' + response);
            outputChannel.show();
            logger.info(`AI Interaction - User: ${userInput}`);
            logger.info(`AI Interaction - Response: ${response}`);
        } catch (error) {
            logger.error(`Error interacting with AI: ${error}`);
            vscode.window.showErrorMessage(`Error interacting with AI: ${error}`);
        }
    });
}
