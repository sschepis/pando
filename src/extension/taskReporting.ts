import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TaskResult {
    taskName: string;
    status: 'success' | 'failure';
    output: string;
    duration: number;
}

class PredictiveModel {
    private historicalData: Map<string, number[]> = new Map();

    addDataPoint(taskName: string, duration: number) {
        if (!this.historicalData.has(taskName)) {
            this.historicalData.set(taskName, []);
        }
        this.historicalData.get(taskName)!.push(duration);
    }

    predict(taskName: string): number | null {
        const data = this.historicalData.get(taskName);
        if (!data || data.length < 3) {
            return null;
        }
        // Simple moving average prediction
        const recentData = data.slice(-3);
        return recentData.reduce((a, b) => a + b, 0) / recentData.length;
    }
}

export class TaskReporter {
    private results: TaskResult[] = [];
    private predictiveModel = new PredictiveModel();

    addResult(result: TaskResult) {
        this.results.push(result);
        this.predictiveModel.addDataPoint(result.taskName, result.duration);
    }

    getTaskNames(): string[] {
        return this.results.map(r => r.taskName);
    }

    async generateReport(): Promise<string> {
        const reportContent = this.results.map(result => {
            const prediction = this.predictiveModel.predict(result.taskName);
            const predictionText = prediction ? `\nPredicted Duration for Next Run: ${prediction.toFixed(2)}ms` : '';
            return `
Task: ${result.taskName}
Status: ${result.status}
Duration: ${result.duration}ms${predictionText}
Output:
${result.output}
-------------------
`;
        }).join('\n');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFileName = `task_report_${timestamp}.txt`;

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder open');
        }

        const reportPath = path.join(workspaceFolders[0].uri.fsPath, reportFileName);
        fs.writeFileSync(reportPath, reportContent);

        return reportPath;
    }

    async compareResults(taskName1: string, taskName2: string): Promise<string> {
        const result1 = this.results.find(r => r.taskName === taskName1);
        const result2 = this.results.find(r => r.taskName === taskName2);

        if (!result1 || !result2) {
            throw new Error('One or both tasks not found');
        }

        const prediction1 = this.predictiveModel.predict(taskName1);
        const prediction2 = this.predictiveModel.predict(taskName2);

        const comparisonContent = `
Comparison of "${taskName1}" and "${taskName2}":

Status:
${taskName1}: ${result1.status}
${taskName2}: ${result2.status}

Duration:
${taskName1}: ${result1.duration}ms
${taskName2}: ${result2.duration}ms

Performance Difference: ${Math.abs(result1.duration - result2.duration)}ms
Faster Task: ${result1.duration < result2.duration ? taskName1 : taskName2}

Predictions for Next Run:
${taskName1}: ${prediction1 ? `${prediction1.toFixed(2)}ms` : 'Not enough data'}
${taskName2}: ${prediction2 ? `${prediction2.toFixed(2)}ms` : 'Not enough data'}

Output Comparison:
${taskName1}:
${result1.output}

${taskName2}:
${result2.output}
`;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const comparisonFileName = `task_comparison_${timestamp}.txt`;

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder open');
        }

        const comparisonPath = path.join(workspaceFolders[0].uri.fsPath, comparisonFileName);
        fs.writeFileSync(comparisonPath, comparisonContent);

        return comparisonPath;
    }
}

export function registerTaskReportingCommands(context: vscode.ExtensionContext) {
    const taskReporter = new TaskReporter();

    context.subscriptions.push(
        vscode.tasks.onDidEndTaskProcess(e => {
            const result: TaskResult = {
                taskName: e.execution.task.name,
                status: e.exitCode === 0 ? 'success' : 'failure',
                output: e.execution.task.detail || 'No output',
                duration: Date.now() - e.execution.task.definition.created
            };
            taskReporter.addResult(result);
        }),

        vscode.commands.registerCommand('pando.generateTaskReport', async () => {
            try {
                const reportPath = await taskReporter.generateReport();
                const doc = await vscode.workspace.openTextDocument(reportPath);
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage(`Task report generated: ${reportPath}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error generating task report: ${error}`);
            }
        }),

        vscode.commands.registerCommand('pando.compareTaskResults', async () => {
            try {
                const taskNames = taskReporter.getTaskNames();
                const task1 = await vscode.window.showQuickPick(taskNames, { placeHolder: 'Select first task to compare' });
                if (!task1) return;

                const task2 = await vscode.window.showQuickPick(taskNames.filter(t => t !== task1), { placeHolder: 'Select second task to compare' });
                if (!task2) return;

                const comparisonPath = await taskReporter.compareResults(task1, task2);
                const doc = await vscode.workspace.openTextDocument(comparisonPath);
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage(`Task comparison generated: ${comparisonPath}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error comparing task results: ${error}`);
            }
        })
    );
}
