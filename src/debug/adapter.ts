import * as vscode from 'vscode';
import { PromptRunner } from '../utils/promptRunner';
import { DebuggerInterface } from '../types/DebuggerInterface';

export interface AIAssistantDebugAdapter {
    getDebuggerInterface(): DebuggerInterface;
    sendResponse(response: any): void;
    sendEvent(event: string, body?: any): void;
}

export class AIAssistantDebugAdapterImpl implements AIAssistantDebugAdapter {
    private promptRunner: PromptRunner;
    private debuggerInterface: DebuggerInterface;

    constructor() {
        this.promptRunner = new PromptRunner();
        this.debuggerInterface = new DebuggerInterface(this.promptRunner);
    }

    getDebuggerInterface(): DebuggerInterface {
        return this.debuggerInterface;
    }

    sendResponse(response: any): void {
        // Implementation for sending debug adapter responses
    }

    sendEvent(event: string, body?: any): void {
        // Implementation for sending debug adapter events
    }
}
