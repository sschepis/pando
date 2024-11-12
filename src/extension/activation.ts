import * as vscode from 'vscode';
import { AIAssistant } from '../ai/AIAssistant';
import { createLogger } from '../ai/logger';
import { activate as activateLanguageServer } from '../languageServer';
import { loadConfiguration } from './configuration';
import { registerProviders } from './providers';
import { registerCommands } from './commands';
import { PandoVSCodeBridge } from '../pandoVSCodeBridge';
import { setupPandoFileWatcher } from './fileWatcher';
import { registerWelcomePage } from './welcomePage';
import { registerConfigWizard } from './configWizard';
import { registerDebugConfigurationProvider } from '../debug/configurations';
import { registerAIDebugHelper } from '../debug/aiDebugHelper';
import { registerTaskTemplateCommands } from './taskTemplates';
import { registerTaskReportingCommands } from './taskReporting';
import { registerTaskManagerCommands } from './taskManager';
import { registerAIDashboardCommand } from './aiDashboard';
import { registerProjectTemplateCommands } from './projectTemplates';
import { registerVersionControlCommands } from './versionControl';
import { registerFileManagementCommands } from './commands/fileManagement';
import { registerPandoExplorer } from './pandoExplorer';

let pandoVSCodeBridge: PandoVSCodeBridge;
let logger: any;

export function activate(context: vscode.ExtensionContext) {
    try {
        logger = createLogger(context);
        logger.info('Pando extension is now active!');
        vscode.window.showInformationMessage('Pando extension is now active!');

        const config = loadConfiguration();

        const aiAssistant = new AIAssistant(config, {}, logger);
        pandoVSCodeBridge = new PandoVSCodeBridge(config, context);

        // Activate language server
        activateLanguageServer(context);

        // Register providers
        registerProviders(context, aiAssistant);

        // Register commands
        registerCommands(context, aiAssistant, pandoVSCodeBridge, config, logger);

        // Set up Pando file watcher
        setupPandoFileWatcher(context, pandoVSCodeBridge, logger);

        // Register debug configuration provider
        registerDebugConfigurationProvider(context);

        // Register AI Debug Helper
        registerAIDebugHelper(context, aiAssistant);

        // Register task template commands
        registerTaskTemplateCommands(context, aiAssistant);

        // Register task reporting commands
        registerTaskReportingCommands(context);

        // Register task manager commands
        registerTaskManagerCommands(context);

        // Register AI Dashboard command
        registerAIDashboardCommand(context, aiAssistant);

        // Register project template commands
        registerProjectTemplateCommands(context, aiAssistant);

        // Register version control commands
        registerVersionControlCommands(context);

        // Register file management commands
        registerFileManagementCommands(context);

        // Register Pando Explorer
        registerPandoExplorer(context);

        // Register and show welcome page
        registerWelcomePage(context, logger, pandoVSCodeBridge);

        // Register configuration wizard
        registerConfigWizard(context);

        // Check if it's the first run and show welcome page if necessary
        const hasShownWelcomePage = context.globalState.get('pandoHasShownWelcomePage', false);
        if (!hasShownWelcomePage) {
            vscode.commands.executeCommand('pando.showWelcomePage');
            context.globalState.update('pandoHasShownWelcomePage', true);
        }

    } catch (error) {
        const errorMessage = `Error activating Pando extension: ${error}`;
        if (logger) {
            logger.error(errorMessage);
        } else {
            console.error(errorMessage);
        }
        vscode.window.showErrorMessage(errorMessage);
    }
}

export function deactivate() {
    logger.info('Pando extension is now deactivated');
    // Clean up resources
}
