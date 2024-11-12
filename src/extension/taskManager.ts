import * as vscode from 'vscode';
import * as os from 'os';

interface TaskDependency {
    taskName: string;
    dependsOn: string[];
    resourceRequirements: {
        cpu: number; // Percentage of CPU usage (0-100)
        memory: number; // Memory usage in MB
    };
}

export class TaskManager {
    private taskDependencies: TaskDependency[] = [];

    addTaskDependency(taskName: string, dependsOn: string[], resourceRequirements: { cpu: number, memory: number }) {
        this.taskDependencies.push({ taskName, dependsOn, resourceRequirements });
    }

    async executeTaskChain(startTaskName: string, parallel: boolean = false): Promise<void> {
        const executionOrder = this.getExecutionOrder(startTaskName);
        
        if (parallel) {
            await this.executeTasksInParallel(executionOrder);
        } else {
            for (const taskName of executionOrder) {
                await this.executeTask(taskName);
            }
        }
    }

    private getExecutionOrder(startTaskName: string): string[] {
        const visited = new Set<string>();
        const executionOrder: string[] = [];

        const dfs = (taskName: string) => {
            if (visited.has(taskName)) return;
            visited.add(taskName);

            const task = this.taskDependencies.find(t => t.taskName === taskName);
            if (task) {
                for (const dependency of task.dependsOn) {
                    dfs(dependency);
                }
            }

            executionOrder.push(taskName);
        };

        dfs(startTaskName);
        return executionOrder;
    }

    private async executeTasksInParallel(taskNames: string[]): Promise<void> {
        const availableResources = this.getAvailableResources();
        const taskPromises: Promise<void>[] = [];

        for (const taskName of taskNames) {
            const task = this.taskDependencies.find(t => t.taskName === taskName);
            if (task && this.hasEnoughResources(availableResources, task.resourceRequirements)) {
                taskPromises.push(this.executeTask(taskName));
                this.allocateResources(availableResources, task.resourceRequirements);
            } else {
                vscode.window.showWarningMessage(`Insufficient resources to execute task "${taskName}". It will be queued.`);
            }
        }

        await Promise.all(taskPromises);
    }

    private async executeTask(taskName: string): Promise<void> {
        const tasks = await vscode.tasks.fetchTasks();
        const task = tasks.find(t => t.name === taskName);

        if (!task) {
            vscode.window.showErrorMessage(`Task "${taskName}" not found`);
            return;
        }

        await vscode.tasks.executeTask(task);
    }

    private getAvailableResources(): { cpu: number, memory: number } {
        const cpus = os.cpus();
        const totalCPU = cpus.length * 100; // Assuming 100% per core
        const freeCPU = totalCPU - (os.loadavg()[0] / cpus.length * 100);
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();

        return {
            cpu: freeCPU,
            memory: freeMemory / (1024 * 1024) // Convert to MB
        };
    }

    private hasEnoughResources(available: { cpu: number, memory: number }, required: { cpu: number, memory: number }): boolean {
        return available.cpu >= required.cpu && available.memory >= required.memory;
    }

    private allocateResources(available: { cpu: number, memory: number }, required: { cpu: number, memory: number }): void {
        available.cpu -= required.cpu;
        available.memory -= required.memory;
    }
}

export function registerTaskManagerCommands(context: vscode.ExtensionContext) {
    const taskManager = new TaskManager();

    context.subscriptions.push(
        vscode.commands.registerCommand('pando.addTaskDependency', async () => {
            const tasks = await vscode.tasks.fetchTasks();
            const taskNames = tasks.map(t => t.name);

            const taskName = await vscode.window.showQuickPick(taskNames, { placeHolder: 'Select a task' });
            if (!taskName) return;

            const dependsOn = await vscode.window.showQuickPick(taskNames.filter(t => t !== taskName), { 
                placeHolder: 'Select dependencies',
                canPickMany: true
            });
            if (!dependsOn) return;

            const cpu = await vscode.window.showInputBox({ prompt: 'Enter required CPU percentage (0-100)', validateInput: input => /^\d+$/.test(input) && parseInt(input) <= 100 ? null : 'Please enter a valid number between 0 and 100' });
            if (!cpu) return;

            const memory = await vscode.window.showInputBox({ prompt: 'Enter required memory in MB', validateInput: input => /^\d+$/.test(input) ? null : 'Please enter a valid number' });
            if (!memory) return;

            taskManager.addTaskDependency(taskName, dependsOn, { cpu: parseInt(cpu), memory: parseInt(memory) });
            vscode.window.showInformationMessage(`Dependencies and resource requirements added for task "${taskName}"`);
        }),

        vscode.commands.registerCommand('pando.executeTaskChain', async () => {
            const tasks = await vscode.tasks.fetchTasks();
            const taskNames = tasks.map(t => t.name);

            const startTaskName = await vscode.window.showQuickPick(taskNames, { placeHolder: 'Select a task to start the chain' });
            if (!startTaskName) return;

            const executionMode = await vscode.window.showQuickPick(['Sequential', 'Parallel'], { placeHolder: 'Select execution mode' });
            if (!executionMode) return;

            const parallel = executionMode === 'Parallel';

            await taskManager.executeTaskChain(startTaskName, parallel);
            vscode.window.showInformationMessage(`Task chain execution completed`);
        })
    );
}
