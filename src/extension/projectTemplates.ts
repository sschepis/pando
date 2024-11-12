import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AIAssistant } from '../ai/AIAssistant';

interface ProjectTemplate {
    name: string;
    description: string;
    files: { [key: string]: string };
}

const industryTemplates: { [key: string]: ProjectTemplate } = {
    webDevelopment: {
        name: 'Web Development',
        description: 'A basic web development project with HTML, CSS, and JavaScript',
        files: {
            'index.html': `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Development Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to Your Web Development Project</h1>
    <script src="script.js"></script>
</body>
</html>`,
            'styles.css': `
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
}`,
            'script.js': `
console.log('Web Development Project initialized');`
        }
    },
    dataScience: {
        name: 'Data Science',
        description: 'A data science project template with Python and Jupyter Notebook',
        files: {
            'data_analysis.ipynb': `{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Data Science Project"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "\n",
    "# Your data analysis code here"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.5"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}`,
            'requirements.txt': `
pandas
numpy
matplotlib
jupyter`
        }
    }
};

let customTemplates: { [key: string]: ProjectTemplate } = {};

export async function createProjectFromTemplate(aiAssistant: AIAssistant) {
    const templateTypes = ['Industry Templates', 'Custom Templates', 'AI-Suggested Structure'];
    const selectedType = await vscode.window.showQuickPick(templateTypes, {
        placeHolder: 'Select template type'
    });

    if (!selectedType) {
        return;
    }

    let template: ProjectTemplate | undefined;

    if (selectedType === 'Industry Templates') {
        const industry = await vscode.window.showQuickPick(Object.keys(industryTemplates), {
            placeHolder: 'Select an industry for your project'
        });

        if (!industry) {
            return;
        }

        template = industryTemplates[industry];
    } else if (selectedType === 'Custom Templates') {
        const customTemplateName = await vscode.window.showQuickPick(Object.keys(customTemplates), {
            placeHolder: 'Select a custom template'
        });

        if (!customTemplateName) {
            return;
        }

        template = customTemplates[customTemplateName];
    } else {
        template = await generateAISuggestedStructure(aiAssistant);
    }

    if (!template) {
        vscode.window.showErrorMessage('Failed to create or select a template');
        return;
    }

    const projectName = await vscode.window.showInputBox({
        prompt: 'Enter a name for your project',
        placeHolder: 'MyProject'
    });

    if (!projectName) {
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const projectPath = path.join(workspaceFolders[0].uri.fsPath, projectName);

    if (fs.existsSync(projectPath)) {
        vscode.window.showErrorMessage(`A folder named ${projectName} already exists`);
        return;
    }

    fs.mkdirSync(projectPath);

    for (const [fileName, content] of Object.entries(template.files)) {
        const filePath = path.join(projectPath, fileName);
        const dirName = path.dirname(filePath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
        fs.writeFileSync(filePath, content.trim());
    }

    vscode.window.showInformationMessage(`Project ${projectName} created successfully`);
}

async function generateAISuggestedStructure(aiAssistant: AIAssistant): Promise<ProjectTemplate | undefined> {
    const projectDescription = await vscode.window.showInputBox({
        prompt: 'Describe your project',
        placeHolder: 'e.g., A web application for managing personal finances'
    });

    if (!projectDescription) {
        return undefined;
    }

    const prompt = `
    Generate a project structure for the following project description:
    "${projectDescription}"

    Provide the response as a JSON object with the following structure:
    {
        "name": "Project Name",
        "description": "Project Description",
        "files": {
            "file/path/example.txt": "File content",
            "another/file.js": "File content"
        }
    }

    Include appropriate files and directories for the described project.
    `;

    try {
        const response = await aiAssistant.processQuery(prompt);
        if (typeof response === 'object' && 'response' in response) {
            const suggestedStructure = JSON.parse(response.response);
            return suggestedStructure as ProjectTemplate;
        } else {
            throw new Error('Unexpected response format from AI Assistant');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error generating AI-suggested structure: ${error}`);
        return undefined;
    }
}

export async function createCustomTemplate() {
    const templateName = await vscode.window.showInputBox({
        prompt: 'Enter a name for your custom template',
        placeHolder: 'MyCustomTemplate'
    });

    if (!templateName) {
        return;
    }

    const description = await vscode.window.showInputBox({
        prompt: 'Enter a description for your custom template',
        placeHolder: 'A custom project template'
    });

    if (!description) {
        return;
    }

    const files: { [key: string]: string } = {};

    while (true) {
        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter a file name (or leave empty to finish)',
            placeHolder: 'example.txt'
        });

        if (!fileName) {
            break;
        }

        const fileContent = await vscode.window.showInputBox({
            prompt: `Enter the content for ${fileName}`,
            placeHolder: 'File content'
        });

        if (fileContent) {
            files[fileName] = fileContent;
        }
    }

    customTemplates[templateName] = {
        name: templateName,
        description,
        files
    };

    vscode.window.showInformationMessage(`Custom template ${templateName} created successfully`);
}

export function registerProjectTemplateCommands(context: vscode.ExtensionContext, aiAssistant: AIAssistant) {
    context.subscriptions.push(
        vscode.commands.registerCommand('pando.createProjectFromTemplate', () => createProjectFromTemplate(aiAssistant)),
        vscode.commands.registerCommand('pando.createCustomTemplate', createCustomTemplate)
    );
}
