import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AIAssistant } from '../ai/AIAssistant';

interface TaskTemplate {
    name: string;
    description: string;
    taskDefinition: vscode.TaskDefinition;
}

export class TaskTemplateManager {
    private templates: TaskTemplate[] = [
        {
            name: 'Pando Prompt Execution',
            description: 'Execute a Pando prompt',
            taskDefinition: {
                type: 'pando',
                command: 'runPrompt',
                promptName: '${promptName}'
            }
        },
        {
            name: 'Pando File Analysis',
            description: 'Analyze a Pando file',
            taskDefinition: {
                type: 'pando',
                command: 'analyzeFile',
                filePath: '${filePath}'
            }
        },
        {
            name: 'Pando Project Generation',
            description: 'Generate a new Pando project',
            taskDefinition: {
                type: 'pando',
                command: 'generateProject',
                projectName: '${projectName}',
                template: '${template}'
            }
        }
    ];

    private readonly TEMPLATES_DIR = 'pando-task-templates';

    constructor(private aiAssistant: AIAssistant) {}

    getTemplates(): TaskTemplate[] {
        return this.templates;
    }

    async createTaskFromTemplate(): Promise<vscode.Task | undefined> {
        const templateNames = this.templates.map(t => t.name);
        const selectedTemplateName = await vscode.window.showQuickPick(templateNames, {
            placeHolder: 'Select a task template'
        });

        if (!selectedTemplateName) {
            return undefined;
        }

        const selectedTemplate = this.templates.find(t => t.name === selectedTemplateName);
        if (!selectedTemplate) {
            return undefined;
        }

        const taskDefinition = { ...selectedTemplate.taskDefinition };

        // Prompt for variable values
        for (const [key, value] of Object.entries(taskDefinition)) {
            if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
                const variableName = value.slice(2, -1);
                const userInput = await vscode.window.showInputBox({
                    prompt: `Enter value for ${variableName}`,
                    placeHolder: variableName
                });
                if (userInput === undefined) {
                    return undefined; // User cancelled
                }
                taskDefinition[key] = userInput;
            }
        }

        return new vscode.Task(
            taskDefinition,
            vscode.TaskScope.Workspace,
            selectedTemplate.name,
            'pando',
            new vscode.ShellExecution(`echo "Executing ${selectedTemplate.name}"`)
        );
    }

    async exportTemplate(template: TaskTemplate): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const templatesDir = path.join(workspaceFolders[0].uri.fsPath, this.TEMPLATES_DIR);
        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir, { recursive: true });
        }

        const fileName = `${template.name.replace(/\s+/g, '_')}.json`;
        const filePath = path.join(templatesDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
        vscode.window.showInformationMessage(`Template exported to ${filePath}`);
    }

    async importTemplate(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const templatesDir = path.join(workspaceFolders[0].uri.fsPath, this.TEMPLATES_DIR);
        if (!fs.existsSync(templatesDir)) {
            vscode.window.showErrorMessage('No templates directory found');
            return;
        }

        const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
        const selectedFile = await vscode.window.showQuickPick(files, {
            placeHolder: 'Select a template to import'
        });

        if (!selectedFile) {
            return;
        }

        const filePath = path.join(templatesDir, selectedFile);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const template: TaskTemplate = JSON.parse(fileContent);

        this.templates.push(template);
        vscode.window.showInformationMessage(`Template ${template.name} imported successfully`);
    }

    async generateAITaskTemplate(): Promise<void> {
        const userInput = await vscode.window.showInputBox({
            prompt: 'Describe the task you want to generate',
            placeHolder: 'e.g., Run tests for the current project and generate a report'
        });

        if (!userInput) {
            return;
        }

        const prompt = `
        Generate a Pando task template based on the following description:
        "${userInput}"

        The template should include:
        1. A name for the task
        2. A brief description
        3. A task definition object with appropriate properties

        Format your response as a JSON object with "name", "description", and "taskDefinition" fields.
        `;

        try {
            const response = await this.aiAssistant.processQuery(prompt);
            if (typeof response === 'object' && 'response' in response) {
                const generatedTemplate: TaskTemplate = JSON.parse(response.response);
                this.templates.push(generatedTemplate);
                vscode.window.showInformationMessage(`AI-generated task template "${generatedTemplate.name}" added successfully`);
            } else {
                throw new Error('Unexpected response format from AI Assistant');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating AI task template: ${error}`);
        }
    }
}

export function registerTaskTemplateCommands(context: vscode.ExtensionContext, aiAssistant: AIAssistant) {
    const taskTemplateManager = new TaskTemplateManager(aiAssistant);

    context.subscriptions.push(
        vscode.commands.registerCommand('pando.createTaskFromTemplate', async () => {
            const task = await taskTemplateManager.createTaskFromTemplate();
            if (task) {
                vscode.tasks.executeTask(task);
            }
        }),
        vscode.commands.registerCommand('pando.exportTaskTemplate', async () => {
            const templates = taskTemplateManager.getTemplates();
            const templateNames = templates.map(t => t.name);
            const selectedTemplateName = await vscode.window.showQuickPick(templateNames, {
                placeHolder: 'Select a template to export'
            });
            if (selectedTemplateName) {
                const template = templates.find(t => t.name === selectedTemplateName);
                if (template) {
                    await taskTemplateManager.exportTemplate(template);
                }
            }
        }),
        vscode.commands.registerCommand('pando.importTaskTemplate', async () => {
            await taskTemplateManager.importTemplate();
        }),
        vscode.commands.registerCommand('pando.generateAITaskTemplate', async () => {
            await taskTemplateManager.generateAITaskTemplate();
        })
    );
}
