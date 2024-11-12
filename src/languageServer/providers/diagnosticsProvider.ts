import * as vscode from 'vscode';

export class PandoDiagnosticsProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('pando');
    }

    public updateDiagnostics(document: vscode.TextDocument): void {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for invalid keywords
            if (!/^(prompt|input|output|tool|condition|action)/.test(line) && line !== '' && !line.startsWith('}')) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(i, 0, i, line.length),
                    `Invalid keyword: ${line.split(' ')[0]}`,
                    vscode.DiagnosticSeverity.Error
                ));
            }

            // Check for missing opening braces
            if (/^(prompt|tool|condition|action)/.test(line) && !line.endsWith('{')) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(i, 0, i, line.length),
                    'Missing opening brace',
                    vscode.DiagnosticSeverity.Error
                ));
            }

            // Add more specific checks here as needed
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public clearDiagnostics(): void {
        this.diagnosticCollection.clear();
    }
}
