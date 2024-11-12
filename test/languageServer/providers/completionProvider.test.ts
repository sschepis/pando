import * as vscode from 'vscode';
import { PandoCompletionProvider } from '../../../src/languageServer/providers/completionProvider';

describe('PandoCompletionProvider', () => {
    let provider: PandoCompletionProvider;
    let mockDocument: vscode.TextDocument;
    let mockPosition: vscode.Position;
    let mockToken: vscode.CancellationToken;

    beforeEach(() => {
        provider = new PandoCompletionProvider();
        mockDocument = {
            getText: jest.fn(),
            lineAt: jest.fn(),
            uri: { fsPath: 'test.pando' }
        } as unknown as vscode.TextDocument;
        mockPosition = new vscode.Position(0, 0);
        mockToken = {} as vscode.CancellationToken;
    });

    describe('provideCompletionItems', () => {
        it('should provide keyword completions', async () => {
            (mockDocument.getText as jest.Mock).mockReturnValue('sys');
            (mockDocument.lineAt as jest.Mock).mockReturnValue({
                text: 'sys',
                range: new vscode.Range(0, 0, 0, 3)
            });

            const completions = await provider.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken
            );

            expect(completions).toBeDefined();
            expect(completions.length).toBeGreaterThan(0);
            expect(completions.some(item => item.label === 'system:')).toBe(true);
        });

        it('should provide snippet completions', async () => {
            (mockDocument.getText as jest.Mock).mockReturnValue('user');
            (mockDocument.lineAt as jest.Mock).mockReturnValue({
                text: 'user',
                range: new vscode.Range(0, 0, 0, 4)
            });

            const completions = await provider.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken
            );

            expect(completions).toBeDefined();
            expect(completions.length).toBeGreaterThan(0);
            expect(completions.some(item => 
                item.kind === vscode.CompletionItemKind.Snippet &&
                item.label === 'user'
            )).toBe(true);
        });

        it('should provide tool completions in tools section', async () => {
            (mockDocument.getText as jest.Mock).mockReturnValue('tools:\n  ');
            (mockDocument.lineAt as jest.Mock).mockReturnValue({
                text: '  ',
                range: new vscode.Range(1, 0, 1, 2)
            });

            const completions = await provider.provideCompletionItems(
                mockDocument,
                mockPosition,
                mockToken
            );

            expect(completions).toBeDefined();
            expect(completions.length).toBeGreaterThan(0);
            expect(completions.some(item => 
                item.kind === vscode.CompletionItemKind.Function
            )).toBe(true);
        });
    });
});
