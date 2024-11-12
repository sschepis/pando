import * as vscode from 'vscode';
import { AIAssistant } from '../../ai/AIAssistant';
import { Config } from '../../ai/types';
import { PandoVSCodeBridge } from '../../pandoVSCodeBridge';

export function registerRunPromptCommand(
    context: vscode.ExtensionContext,
    aiAssistant: AIAssistant,
    pandoVSCodeBridge: PandoVSCodeBridge,
    config: Config,
    logger: any
) {
    return vscode.commands.registerCommand('pando.runPrompt', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'pando') {
            // Execute Pando file
            const document = editor.document;
            const text = document.getText();

            try {
                const result = await pandoVSCodeBridge.executePandoFile(text);
                logger.info(`Executed Pando prompt from file: ${document.fileName}`);
                logger.info(`Result: ${JSON.stringify(result, null, 2)}`);
                vscode.window.showInformationMessage(`Pando prompt executed successfully. Check the output panel for results.`);
            } catch (error) {
                logger.error(`Error executing Pando prompt: ${error}`);
                vscode.window.showErrorMessage(`Error executing Pando prompt: ${error}`);
            }
        } else {
            // Run Pando prompt
            const promptText = await vscode.window.showInputBox({ prompt: 'Enter the prompt name' });
            const prompt = config.prompts.find((p) => p.name === promptText);
            if (!prompt) {
                logger.error(`Prompt "${promptText}" not found`);
                vscode.window.showErrorMessage(`Prompt "${promptText}" not found`);
                return;
            }
            try {
                const response = await aiAssistant.processQuery(JSON.stringify(prompt));
                logger.info(`Prompt: ${promptText}`);
                logger.info(`Response: ${JSON.stringify(response)}`);
            } catch (error) {
                logger.error(`Error executing prompt: ${error}`);
                vscode.window.showErrorMessage(`Error executing prompt: ${error}`);
            }
        }
    });
}
