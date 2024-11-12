import * as vscode from 'vscode';
import { registerProviders } from '@extension/providers';
import { AIAssistantDebugAdapterDescriptorFactory } from '@debug/debugAdapter';
import { AIAssistantEditorProvider } from 'src/customEditor';
import { AIAssistantTaskProvider } from '@extension/providers/aiAssistantTaskProvider';
import { AIAssistant } from '@ai/AIAssistant';
import { mockVscode } from '../setup';

jest.mock('vscode');
jest.mock('@debug/debugAdapter');
jest.mock('src/customEditor');
jest.mock('@extension/providers/aiAssistantTaskProvider');
jest.mock('@ai/AIAssistant');

describe('Providers', () => {
    let mockContext: vscode.ExtensionContext;
    let mockAIAssistant: jest.Mocked<AIAssistant>;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            asAbsolutePath: jest.fn(p => p)
        } as unknown as vscode.ExtensionContext;

        mockAIAssistant = {
            processQuery: jest.fn(),
            handleTaskCompletion: jest.fn()
        } as unknown as jest.Mocked<AIAssistant>;

        jest.clearAllMocks();
    });

    it('should register debug adapter descriptor factory', () => {
        const mockFactory = {} as AIAssistantDebugAdapterDescriptorFactory;
        (AIAssistantDebugAdapterDescriptorFactory as jest.Mock).mockReturnValue(mockFactory);

        registerProviders(mockContext, mockAIAssistant);

        expect(AIAssistantDebugAdapterDescriptorFactory).toHaveBeenCalled();
        expect(vscode.debug.registerDebugAdapterDescriptorFactory).toHaveBeenCalledWith('pando', mockFactory);
        expect(mockContext.subscriptions.push).toHaveBeenCalled();
    });

    it('should register custom editor provider', () => {
        const mockRegister = jest.fn();
        (AIAssistantEditorProvider.register as jest.Mock).mockReturnValue(mockRegister);

        registerProviders(mockContext, mockAIAssistant);

        expect(AIAssistantEditorProvider.register).toHaveBeenCalledWith(mockContext);
        expect(mockContext.subscriptions.push).toHaveBeenCalledWith(mockRegister);
    });

    it('should register task provider', () => {
        const MockTaskProvider = AIAssistantTaskProvider as jest.MockedClass<typeof AIAssistantTaskProvider>;
        const mockTaskProvider = new MockTaskProvider(mockAIAssistant);

        registerProviders(mockContext, mockAIAssistant);

        expect(MockTaskProvider).toHaveBeenCalledWith(mockAIAssistant);
        expect(vscode.tasks.registerTaskProvider).toHaveBeenCalledWith('pando', mockTaskProvider);
        expect(mockContext.subscriptions.push).toHaveBeenCalled();
    });
});
