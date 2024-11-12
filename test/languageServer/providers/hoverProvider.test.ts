import * as vscode from 'vscode';
import { PandoHoverProvider } from '../../../src/languageServer/providers/hoverProvider';

describe('PandoHoverProvider', () => {
    let provider: PandoHoverProvider;

    beforeEach(() => {
        provider = new PandoHoverProvider();
    });

    test('provides hover for known keywords', async () => {
        const document = {
            getText: jest.fn().mockReturnValue('prompt'),
            getWordRangeAtPosition: jest.fn().mockReturnValue(new vscode.Range(0, 0, 0, 6)),
        } as unknown as vscode.TextDocument;

        const position = new vscode.Position(0, 3);
        const token = {} as vscode.CancellationToken;

        const hover = await provider.provideHover(document, position, token);

        expect(hover).toBeDefined();
        expect(hover?.contents).toContain('Defines a prompt for the AI assistant.');
    });

    test('returns null for unknown words', async () => {
        const document = {
            getText: jest.fn().mockReturnValue('unknown'),
            getWordRangeAtPosition: jest.fn().mockReturnValue(new vscode.Range(0, 0, 0, 7)),
        } as unknown as vscode.TextDocument;

        const position = new vscode.Position(0, 3);
        const token = {} as vscode.CancellationToken;

        const hover = await provider.provideHover(document, position, token);

        expect(hover).toBeNull();
    });
});
