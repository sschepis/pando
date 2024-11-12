import * as vscode from 'vscode';
import { AIAssistant } from '../ai/AIAssistant';

export class AIDebugHelper {
    constructor(private aiAssistant: AIAssistant) {}

    async generateEdgeCases(fileUri: vscode.Uri): Promise<string[]> {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const fileContent = document.getText();

        const prompt = `
        Analyze the following Pando code and generate 3-5 edge cases for debugging:

        ${fileContent}

        For each edge case, provide:
        1. A brief description of the scenario
        2. The input values or conditions that trigger this edge case
        3. The expected behavior or output

        Format your response as a JSON array of objects, each containing 'description', 'input', and 'expected' fields.
        `;

        try {
            const response = await this.aiAssistant.processQuery(prompt);
            if (typeof response === 'object' && 'response' in response) {
                const edgeCases = JSON.parse(response.response);
                return edgeCases.map((ec: any) => 
                    `Edge Case: ${ec.description}\nInput: ${ec.input}\nExpected: ${ec.expected}`
                );
            } else {
                throw new Error('Unexpected response format from AI Assistant');
            }
        } catch (error) {
            console.error('Error generating edge cases:', error);
            return ['Error generating edge cases. Please try again.'];
        }
    }
}

export function registerAIDebugHelper(context: vscode.ExtensionContext, aiAssistant: AIAssistant) {
    const aiDebugHelper = new AIDebugHelper(aiAssistant);

    context.subscriptions.push(
        vscode.commands.registerCommand('pando.generateEdgeCases', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.languageId === 'pando') {
                const edgeCases = await aiDebugHelper.generateEdgeCases(activeEditor.document.uri);
                const edgeCasesContent = edgeCases.join('\n\n');
                
                const edgeCasesDoc = await vscode.workspace.openTextDocument({
                    content: edgeCasesContent,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(edgeCasesDoc, { viewColumn: vscode.ViewColumn.Beside });
            } else {
                vscode.window.showErrorMessage('Please open a Pando file to generate edge cases.');
            }
        })
    );
}
