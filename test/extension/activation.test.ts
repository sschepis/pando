import * as vscode from 'vscode';
import { mockVscode } from '../setup';
import { activate, deactivate } from '@extension/activation';
import { createLogger } from '@ai/logger';
import { loadConfiguration } from '@extension/configuration';
import { AIAssistant } from '@ai/AIAssistant';
import { createPandoExecutionEngine } from '@pandoExecutionEngine/index';
import { activateLanguageServer } from '@languageServer/client';
import { registerProviders } from '@extension/providers';
import { registerCommands } from '@extension/commands';

jest.mock('@ai/logger');
jest.mock('@extension/configuration');
jest.mock('@ai/AIAssistant');
jest.mock('@pandoExecutionEngine/index');
jest.mock('@languageServer/client');
jest.mock('@extension/providers');
jest.mock('@extension/commands');

describe('Activation', () => {
    let mockContext: vscode.ExtensionContext;
    let mockConfig: any;
    let mockAIAssistant: jest.Mocked<AIAssistant>;
    let mockPandoExecutionEngine: any;
    let mockLogger: any;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            asAbsolutePath: jest.fn(p => p),
            globalState: {
                get: jest.fn(),
                update: jest.fn()
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            }
        } as unknown as vscode.ExtensionContext;

        mockConfig = {
            provider: 'test-provider',
            apiKey: 'test-key'
        };

        mockLogger = {
            info: jest.fn(),
            error: jest.fn()
        };

        (createLogger as jest.Mock).mockReturnValue(mockLogger);
        (loadConfiguration as jest.Mock).mockReturnValue(mockConfig);
        mockAIAssistant = {
            processQuery: jest.fn(),
            handleTaskCompletion: jest.fn()
        } as unknown as jest.Mocked<AIAssistant>;
        
        (AIAssistant as jest.MockedClass<typeof AIAssistant>).mockImplementation(
            () => mockAIAssistant
        );
        
        mockPandoExecutionEngine = {
            executePrompt: jest.fn()
        };
        (createPandoExecutionEngine as jest.Mock).mockReturnValue(mockPandoExecutionEngine);

        jest.clearAllMocks();
    });

    it('should activate the extension correctly', () => {
        activate(mockContext);

        expect(createLogger).toHaveBeenCalledWith(mockContext);
        expect(mockLogger.info).toHaveBeenCalledWith('Pando extension is now active!');
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Pando extension is now active!');
        expect(loadConfiguration).toHaveBeenCalled();
        expect(AIAssistant).toHaveBeenCalledWith(mockConfig, {}, mockLogger);
        expect(createPandoExecutionEngine).toHaveBeenCalledWith(mockAIAssistant);
        expect(activateLanguageServer).toHaveBeenCalledWith(mockContext);
        expect(registerProviders).toHaveBeenCalledWith(mockContext, mockAIAssistant);
        expect(registerCommands).toHaveBeenCalledWith(mockContext, mockAIAssistant, mockPandoExecutionEngine, mockConfig, mockLogger);
    });

    it('should deactivate the extension correctly', () => {
        expect(() => deactivate()).not.toThrow();
    });
});
