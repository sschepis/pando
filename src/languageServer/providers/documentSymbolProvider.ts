import * as vscode from 'vscode';

export class PandoDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        const symbols: vscode.DocumentSymbol[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('prompt') || line.startsWith('tool')) {
                const name = line.split(' ')[1];
                const range = new vscode.Range(i, 0, i, line.length);
                const symbol = new vscode.DocumentSymbol(
                    name,
                    line.startsWith('prompt') ? 'Prompt' : 'Tool',
                    line.startsWith('prompt') ? vscode.SymbolKind.Function : vscode.SymbolKind.Method,
                    range,
                    range
                );
                symbols.push(symbol);
            }
        }

        return symbols;
    }
}
