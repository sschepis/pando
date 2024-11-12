import * as vscode from 'vscode';
import { AIAssistant } from '../../ai/AIAssistant';
import { AIAssistantTaskTerminal } from '../../extension/providers/aiAssistantTaskTerminal';

export class AIAssistantTaskProvider implements vscode.TaskProvider {
    static taskType = 'pando';
    private aiAssistant: AIAssistant;

    constructor(aiAssistant: AIAssistant) {
        this.aiAssistant = aiAssistant;
    }

    public provideTasks(): vscode.Task[] {
        const runPromptTask = new vscode.Task(
            { type: AIAssistantTaskProvider.taskType, task: 'runPrompt' },
            vscode.TaskScope.Workspace,
            'Run Pando Prompt',
            AIAssistantTaskProvider.taskType,
            new vscode.ShellExecution('echo "Running Pando Prompt"')
        );
        return [runPromptTask];
    }

    public resolveTask(task: vscode.Task): vscode.Task | undefined {
        if (task.definition.task === 'runPrompt') {
            const definition = task.definition as { type: string; task: string };
            return new vscode.Task(
                definition,
                task.scope ?? vscode.TaskScope.Workspace,
                definition.task,
                AIAssistantTaskProvider.taskType,
                new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
                    return new AIAssistantTaskTerminal(this.aiAssistant);
                })
            );
        }
        return undefined;
    }
}
