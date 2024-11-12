import * as vscode from 'vscode';
import { AIAssistant } from '../ai/AIAssistant';
import { Config } from '../ai/types';
import { PandoVSCodeBridge } from '../pandoVSCodeBridge';
import { registerRunPromptCommand } from './commands/runPrompt';
import { registerNewFileCommand } from './commands/newFile';
import { registerInteractWithAICommand } from './commands/interactWithAI';
import { registerFileManagementCommands } from './commands/fileManagement';
import { registerVersionControlCommands } from './versionControl';
import { registerFileOrganizerCommand } from './fileOrganizer';
import { registerProjectTemplateCommands } from './projectTemplates';
import { registerAIDashboardCommand } from './aiDashboard';

export function registerCommands(
    context: vscode.ExtensionContext,
    aiAssistant: AIAssistant,
    pandoVSCodeBridge: PandoVSCodeBridge,
    config: Config,
    logger: any
) {
    context.subscriptions.push(
        registerRunPromptCommand(context, aiAssistant, pandoVSCodeBridge, config, logger),
        registerNewFileCommand(context, logger),
        registerInteractWithAICommand(context, aiAssistant, logger)
    );

    // Register file management commands
    registerFileManagementCommands(context);

    // Register version control commands
    registerVersionControlCommands(context);

    // Register file organizer command
    registerFileOrganizerCommand(context);

    // Register project template commands
    registerProjectTemplateCommands(context, aiAssistant);

    // Register AI Dashboard command
    registerAIDashboardCommand(context, aiAssistant);
}
