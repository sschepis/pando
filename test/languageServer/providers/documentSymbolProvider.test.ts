import * as vscode from 'vscode';
import { PandoDocumentSymbolProvider } from '../../../src/languageServer/providers/documentSymbolProvider';

describe('PandoDocumentSymbolProvider', () => {
    let provider: PandoDocumentSymbolProvider;

    beforeEach(() => {
        provider = new PandoDocumentSymbolProvider();
    });

    test('provides document symbols for prompts and tools', async () => {
        const document = {
            getText: jest.fn().mockReturnValue('prompt myPrompt {\n}\n\ntool myTool {\n}'),
            lineAt: jest.fn().mockImplementation((line: number) => ({
                text: line === 0 ? 'prompt myPrompt {' : 'tool myTool {',
                range: new vscode.Range(line, 0, line, line === 0 ? 17 : 14)
            })),
        } as unknown as vscode.TextDocument;

        const token = {} as vscode.CancellationToken;

        const symbols = await provider.provideDocumentSymbols(document, token);

        expect(symbols).toBeDefined();
        expect(symbols?.length).toBe(2);
        expect(symbols?.[0].name).toBe('myPrompt');
        expect(symbols?.[1].name).toBe('myTool');
    });

    test('returns empty array for document with no symbols', async () => {
        const document = {
            getText: jest.fn().mockReturnValue('Some text without symbols'),
            lineAt: jest.fn().mockReturnValue({
                text: 'Some text without symbols',
                range: new vscode.Range(0, 0, 0, 26)
            }),
        } as unknown as vscode.TextDocument;

        const token = {} as vscode.CancellationToken;

        const symbols = await provider.provideDocumentSymbols(document, token);

        expect(symbols).toBeDefined();
        expect(symbols?.length).toBe(0);
    });
});
