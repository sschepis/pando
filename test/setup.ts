import * as vscode from 'vscode';
import '@jest/globals';

// Mock VSCode API
const mockVscode = {
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        createOutputChannel: jest.fn(),
        showTextDocument: jest.fn(),
        activeTextEditor: {
            document: {
                getText: jest.fn(),
                uri: { fsPath: 'test.pando' }
            }
        }
    },
    workspace: {
        getConfiguration: jest.fn(),
        workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
        openTextDocument: jest.fn(),
        applyEdit: jest.fn()
    },
    commands: {
        registerCommand: jest.fn(),
        executeCommand: jest.fn()
    },
    languages: {
        createDiagnosticCollection: jest.fn(),
        registerCompletionItemProvider: jest.fn(),
        registerHoverProvider: jest.fn(),
        registerDocumentSymbolProvider: jest.fn(),
        registerDocumentFormattingEditProvider: jest.fn()
    },
    debug: {
        registerDebugAdapterDescriptorFactory: jest.fn()
    },
    ExtensionContext: jest.fn().mockImplementation(() => ({
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
    })),
    Range: jest.fn(),
    Position: jest.fn(),
    Location: jest.fn(),
    SymbolKind: {
        Class: 0,
        Method: 1,
        Property: 2
    },
    CompletionItemKind: {
        Keyword: 0,
        Method: 1,
        Property: 2
    },
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2
    },
    Uri: {
        file: jest.fn(f => ({ fsPath: f })),
        parse: jest.fn()
    },
    EventEmitter: jest.fn(),
    Disposable: {
        from: jest.fn()
    },
    WorkspaceEdit: jest.fn(),
    tasks: {
        registerTaskProvider: jest.fn()
    }
};

// Mock the vscode module
jest.mock('vscode', () => mockVscode, { virtual: true });

// Mock fs module
jest.mock('fs', () => ({
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        mkdir: jest.fn()
    }
}));

// Export mocked vscode for use in tests
export { mockVscode };
