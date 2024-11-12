import * as vscode from 'vscode';
import { PandoDiagnosticsProvider } from '../../../src/languageServer/providers/diagnosticsProvider';

describe('PandoDiagnosticsProvider', () => {
    let provider: PandoDiagnosticsProvider;
    let mockDiagnosticCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        mockDiagnosticCollection = {
            set: jest.fn(),
            clear: jest.fn(),
        } as unknown as vscode.DiagnosticCollection;

        jest.spyOn(vscode.languages, 'createDiagnosticCollection').mockReturnValue(mockDiagnosticCollection);

        provider = new PandoDiagnosticsProvider();
    });

    test('updates diagnostics for invalid keywords', () => {
        const document = {
            uri: { fsPath: 'test.pando' } as vscode.Uri,
            getText: jest.fn().mockReturnValue('invalid keyword\nprompt myPrompt {\n}\n'),
            lineAt: jest.fn().mockImplementation((line: number) => ({
                text: ['invalid keyword', 'prompt myPrompt {', '}'][line],
                range: new vscode.Range(line, 0, line, ['invalid keyword', 'prompt myPrompt {', '}'][line].length)
            })),
        } as unknown as vscode.TextDocument;

        provider.updateDiagnostics(document);

        expect(mockDiagnosticCollection.set).toHaveBeenCalledWith(document.uri, expect.arrayContaining([
            expect.objectContaining({
                message: expect.stringContaining('Invalid keyword'),
                range: expect.any(vscode.Range),
                severity: vscode.DiagnosticSeverity.Error,
            })
        ]));
    });

    test('updates diagnostics for missing opening braces', () => {
        const document = {
            uri: { fsPath: 'test.pando' } as vscode.Uri,
            getText: jest.fn().mockReturnValue('prompt myPrompt\ninput {}\n'),
            lineAt: jest.fn().mockImplementation((line: number) => ({
                text: ['prompt myPrompt', 'input {}'][line],
                range: new vscode.Range(line, 0, line, ['prompt myPrompt', 'input {}'][line].length)
            })),
        } as unknown as vscode.TextDocument;

        provider.updateDiagnostics(document);

        expect(mockDiagnosticCollection.set).toHaveBeenCalledWith(document.uri, expect.arrayContaining([
            expect.objectContaining({
                message: 'Missing opening brace',
                range: expect.any(vscode.Range),
                severity: vscode.DiagnosticSeverity.Error,
            })
        ]));
    });

    test('clears diagnostics', () => {
        provider.clearDiagnostics();

        expect(mockDiagnosticCollection.clear).toHaveBeenCalled();
    });
});
