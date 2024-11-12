import * as vscode from 'vscode';
import { mockVscode } from '../setup';
import { registerCommands } from '@extension/commands';
import { AIAssistant } from '@ai/AIAssistant';
import { PandoVSCodeBridge } from 'src/pandoVSCodeBridge';
import { Config, Tool, RunnerOptions, Provider } from '@ai/types';

jest.mock('@extension/commands');
jest.mock('@ai/AIAssistant');
jest.mock('src/pandoVSCodeBridge');

describe('Commands', () => {
    let mockContext: vscode.ExtensionContext;
    let mockAIAssistant: jest.Mocked<AIAssistant>;
    let mockPandoVSCodeBridge: jest.Mocked<PandoVSCodeBridge>;
    let mockConfig: Config;
    let mockLogger: any;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            asAbsolutePath: jest.fn(p => p)
        } as unknown as vscode.ExtensionContext;

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        const mockProvider: Provider = {
            name: 'test-provider',
            url: 'https://test.api',
            path: '/v1/chat',
            headers: { 'Authorization': 'Bearer test-key' },
            client: {} as any,
            requestObject: {
                getMessage: jest.fn(),
                getOptions: jest.fn()
            },
            responseFormat: {
                getContent: jest.fn()
            },
            toolFormat: {
                formatTools: jest.fn()
            }
        };

        mockConfig = {
            provider: mockProvider,
            tools: [],
            prompts: []
        };

        mockAIAssistant = {
            processQuery: jest.fn(),
            handleTaskCompletion: jest.fn()
        } as unknown as jest.Mocked<AIAssistant>;

        mockPandoVSCodeBridge = {
            executePandoFile: jest.fn().mockResolvedValue({ response: 'Test response' }),
            showProgress: jest.fn()
        } as unknown as jest.Mocked<PandoVSCodeBridge>;

        jest.clearAllMocks();
    });

    it('should register pando.runPrompt command', () => {
        registerCommands(mockContext, mockAIAssistant, mockPandoVSCodeBridge, mockConfig, mockLogger);

        expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
            'pando.runPrompt',
            expect.any(Function)
        );
    });

    it('should execute Pando prompt when pando.runPrompt is called', async () => {
        const mockEditor = {
            document: {
                getText: jest.fn().mockReturnValue('mock pando content'),
                fileName: 'test.pando'
            }
        };

        (vscode.window.activeTextEditor as any) = mockEditor;

        registerCommands(mockContext, mockAIAssistant, mockPandoVSCodeBridge, mockConfig, mockLogger);

        // Get the registered command function
        const runPromptCommand = (vscode.commands.registerCommand as jest.Mock).mock.calls
            .find(call => call[0] === 'pando.runPrompt')[1];

        // Execute the command
        await runPromptCommand();

        expect(mockPandoVSCodeBridge.executePandoFile).toHaveBeenCalledWith('mock pando content');
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Executed Pando prompt from file: test.pando'));
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(expect.stringContaining('Pando prompt executed successfully'));
    });
});
