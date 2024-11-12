import * as vscode from 'vscode';
import { AIAssistant } from '../../ai/AIAssistant';
import { executePromptWithTimeout } from '../../ai/runner';
import { defaultConfig } from '../../ai/config/index';
import { Prompt } from '../../ai/types';

export class AIAssistantTaskTerminal implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    private closeEmitter = new vscode.EventEmitter<number>();
    onDidClose?: vscode.Event<number> = this.closeEmitter.event;

    constructor(private aiAssistant: AIAssistant) {}

    open(initialDimensions: vscode.TerminalDimensions | undefined): void {
        this.doPrint('Pando Task Terminal\r\n');
        this.doPrint('Enter your prompt:\r\n');
    }

    close(): void {}

    handleInput(data: string): void {
        if (data === '\r') {  // Enter key
            this.doPrint('\r\n');
            this.runPrompt();
        } else {
            this.doPrint(data);
        }
    }

    private doPrint(message: string) {
        this.writeEmitter.fire(message);
    }

    private async runPrompt() {
        try {
            const mainPrompt: Prompt | undefined = defaultConfig.prompts.find((prompt: Prompt) => prompt.name === 'main');
            if(!mainPrompt) {
                throw new Error('Main prompt not found in config');
            }
            const response = await executePromptWithTimeout(this.aiAssistant, mainPrompt, {}, defaultConfig.provider);
            this.doPrint(`Response: ${response}\r\n`);
        } catch (error) {
            this.doPrint(`Error: ${error}\r\n`);
        }
        this.closeEmitter.fire(0);
    }
}
