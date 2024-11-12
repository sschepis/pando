import * as vscode from 'vscode';
import { PandoDocumentFormattingProvider } from '../../../src/languageServer/providers/formattingProvider';

describe('PandoDocumentFormattingProvider', () => {
    let provider: PandoDocumentFormattingProvider;

    beforeEach(() => {
        provider = new PandoDocumentFormattingProvider();
    });

    test('provides formatting edits', async () => {
        const document = {
            getText: jest.fn().mockReturnValue('prompt myPrompt{\ninput{}\noutput{}\n}'),
            lineAt: jest.fn().mockImplementation((line: number) => ({
                text: ['prompt myPrompt{', 'input{}', 'output{}', '}'][line],
                range: new vscode.Range(line, 0, line, ['prompt myPrompt{', 'input{}', 'output{}', '}'][line].length)
            })),
            lineCount: 4,
        } as unknown as vscode.TextDocument;

        const options = {
            insertSpaces: true,
            tabSize: 2
        } as vscode.FormattingOptions;

        const token = {} as vscode.CancellationToken;

        const edits = await provider.provideDocumentFormattingEdits(document, options, token);

        expect(edits).toBeDefined();
        expect(edits?.length).toBe(4);
        expect(edits?.[0].newText).toBe('prompt myPrompt{');
        expect(edits?.[1].newText).toBe('  input{}');
        expect(edits?.[2].newText).toBe('  output{}');
        expect(edits?.[3].newText).toBe('}');
    });

    test('handles empty document', async () => {
        const document = {
            getText: jest.fn().mockReturnValue(''),
            lineAt: jest.fn().mockReturnValue({
                text: '',
                range: new vscode.Range(0, 0, 0, 0)
            }),
            lineCount: 1,
        } as unknown as vscode.TextDocument;

        const options = {
            insertSpaces: true,
            tabSize: 2
        } as vscode.FormattingOptions;

        const token = {} as vscode.CancellationToken;

        const edits = await provider.provideDocumentFormattingEdits(document, options, token);

        expect(edits).toBeDefined();
        expect(edits?.length).toBe(1);
        expect(edits?.[0].newText).toBe('');
    });
});
