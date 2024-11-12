import * as vscode from 'vscode';

// VSCode-specific test utilities
export const createMockTextDocument = (content: string = '') => ({
    getText: jest.fn().mockReturnValue(content),
    lineAt: jest.fn().mockImplementation((line: number) => ({
        text: content.split('\n')[line] || '',
        range: new vscode.Range(line, 0, line, 0)
    })),
    uri: { fsPath: 'test.pando' },
    fileName: 'test.pando',
    languageId: 'pando'
});

export const createMockTextEditor = (document = createMockTextDocument()) => ({
    document,
    edit: jest.fn().mockImplementation(callback => {
        callback({
            insert: jest.fn(),
            delete: jest.fn(),
            replace: jest.fn()
        });
        return Promise.resolve(true);
    }),
    selection: new vscode.Selection(0, 0, 0, 0)
});

// Common mock factory for VSCode extension context
export const createMockExtensionContext = () => ({
    subscriptions: [],
    extensionPath: '/test/extension/path',
    globalState: {
        get: jest.fn(),
        update: jest.fn()
    },
    workspaceState: {
        get: jest.fn(),
        update: jest.fn()
    }
});

// Helper to create mock workspace configuration
export const createMockWorkspaceConfig = (config = {}) => ({
    get: jest.fn().mockImplementation(key => config[key]),
    update: jest.fn(),
    has: jest.fn().mockImplementation(key => key in config)
});

// Helper to wait for async operations
export const waitForCondition = async (
    condition: () => boolean,
    timeout: number = 1000,
    interval: number = 100
): Promise<void> => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    if (!condition()) {
        throw new Error('Condition not met within timeout');
    }
};
