import * as vscode from 'vscode';
import { AIAssistant } from './ai/AIAssistant';

export function registerAIAssistantTasks(context: vscode.ExtensionContext) {
    const taskProvider = vscode.tasks.registerTaskProvider('pando', new AIAssistantTaskProvider());
    context.subscriptions.push(taskProvider);
}

class AIAssistantTaskProvider implements vscode.TaskProvider {
    static taskType = 'pando';
    private aiAssistant: AIAssistant;

    constructor() {
        this.aiAssistant = new AIAssistant({} as any, {} as any, console as any);
    }

    public provideTasks(): vscode.Task[] | undefined {
        return undefined;
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const task = _task.definition.task;
        if (task) {
            const definition: AIAssistantTaskDefinition = <any>_task.definition;
            return new vscode.Task(
                definition,
                _task.scope ?? vscode.TaskScope.Workspace,
                definition.task,
                AIAssistantTaskProvider.taskType,
                new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
                    return new AIAssistantTaskTerminal(this.aiAssistant, definition.task, definition.args);
                })
            );
        }
        return undefined;
    }
}

interface AIAssistantTaskDefinition extends vscode.TaskDefinition {
    task: string;
    args?: string[];
}

class AIAssistantTaskTerminal implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    private closeEmitter = new vscode.EventEmitter<number>();
    onDidClose?: vscode.Event<number> = this.closeEmitter.event;

    constructor(private aiAssistant: AIAssistant, private task: string, private args: string[] = []) { }

    open(_initialDimensions: vscode.TerminalDimensions | undefined): void {
        this.doPrintLine(`Executing Pando task: ${this.task}`);
        this.doAIAssistantTask();
    }

    close(): void { }

    private doPrintLine(line: string): void {
        this.writeEmitter.fire(line + '\r\n');
    }

    private async doAIAssistantTask(): Promise<void> {
        try {
            const result = await this.aiAssistant.processQuery(`${this.task} ${this.args.join(' ')}`);
            this.doPrintLine(`Task result: ${result.response}`);
            this.doPrintLine(`Task completed: ${result.taskCompleted}`);
            this.closeEmitter.fire(0);
        } catch (error) {
            this.doPrintLine(`Error executing task: ${error}`);
            this.closeEmitter.fire(1);
        }
    }
}
