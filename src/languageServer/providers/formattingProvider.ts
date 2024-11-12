import * as vscode from 'vscode';
import { LanguageServerError } from '../../errors';

interface FormattingState {
    indentLevel: number;
    inMultiLineString: boolean;
    lastNonEmptyLine: string;
    lastIndentLevel: number;
}

export class PandoDocumentFormattingProvider implements vscode.DocumentFormattingEditProvider {
    private readonly INDENT_SIZE = 2;
    private readonly MAX_LINE_LENGTH = 120;

    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        try {
            const edits: vscode.TextEdit[] = [];
            const text = document.getText();
            const lines = text.split('\n');
            const state: FormattingState = {
                indentLevel: 0,
                inMultiLineString: false,
                lastNonEmptyLine: '',
                lastIndentLevel: 0
            };

            let offset = 0;
            for (let i = 0; i < lines.length; i++) {
                if (token.isCancellationRequested) {
                    break;
                }

                const line = lines[i];
                const lineLength = line.length;
                const trimmedLine = line.trim();
                
                try {
                    const startPos = document.positionAt(offset);
                    const endPos = document.positionAt(offset + lineLength);
                    const range = new vscode.Range(startPos, endPos);

                    // Handle formatting
                    const formattedLine = this.formatLine(trimmedLine, state, i === lines.length - 1);
                    edits.push(vscode.TextEdit.replace(range, formattedLine));

                    // Update state for next line
                    if (trimmedLine.length > 0) {
                        state.lastNonEmptyLine = trimmedLine;
                        state.lastIndentLevel = state.indentLevel;
                    }

                    offset += lineLength + 1; // +1 for the newline character
                } catch (error: unknown) {
                    throw new LanguageServerError(
                        `Error formatting line ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
                        error
                    );
                }
            }

            return edits;
        } catch (error: unknown) {
            throw new LanguageServerError(
                `Error providing formatting edits: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    private formatLine(line: string, state: FormattingState, isLastLine: boolean): string {
        // Handle empty lines
        if (line.length === 0) {
            return '';
        }

        // Handle comments
        if (line.startsWith('#')) {
            return this.getIndentation(state.indentLevel) + line;
        }

        // Handle multi-line strings
        if (this.isMultiLineStringDelimiter(line)) {
            state.inMultiLineString = !state.inMultiLineString;
            return this.getIndentation(state.indentLevel) + line;
        }

        if (state.inMultiLineString) {
            return this.getIndentation(state.indentLevel + 1) + line;
        }

        // Handle block starts and ends
        if (this.isBlockEnd(line)) {
            state.indentLevel = Math.max(0, state.indentLevel - 1);
        }

        const indentedLine = this.getIndentation(state.indentLevel) + line;

        if (this.isBlockStart(line)) {
            state.indentLevel++;
        }

        // Handle long lines
        if (indentedLine.length > this.MAX_LINE_LENGTH) {
            return this.wrapLongLine(indentedLine, state.indentLevel);
        }

        return indentedLine;
    }

    private isBlockStart(line: string): boolean {
        const blockStartPatterns = [
            // Section headers
            /^(system|user|assistant|function):$/,
            /^(tools|parameters|then|variables|config):$/,
            // Object/array starts
            /{$/,
            /\[$/,
            // Special Pando constructs
            /^if\s+.*:$/,
            /^else:$/,
            /^loop:$/,
            /^try:$/,
            /^catch:$/,
            /^finally:$/,
            // Function definitions
            /^def\s+\w+\s*\([^)]*\):$/,
            // Multi-line string starts
            /"""|'''$/
        ];

        return blockStartPatterns.some(pattern => pattern.test(line));
    }

    private isBlockEnd(line: string): boolean {
        const blockEndPatterns = [
            /^}$/,
            /^\]$/,
            /^end(\s+\w+)?$/,
            /^"""$|^'''$/
        ];

        return blockEndPatterns.some(pattern => pattern.test(line));
    }

    private isMultiLineStringDelimiter(line: string): boolean {
        return /^"""|^'''|"""$|'''$/.test(line.trim());
    }

    private getIndentation(level: number): string {
        return ' '.repeat(level * this.INDENT_SIZE);
    }

    private wrapLongLine(line: string, indentLevel: number): string {
        const parts = line.split(/(\s+)/);
        let currentLine = '';
        const lines: string[] = [];
        const baseIndent = this.getIndentation(indentLevel);
        const continuationIndent = this.getIndentation(indentLevel + 1);

        for (const part of parts) {
            if (currentLine.length + part.length > this.MAX_LINE_LENGTH && currentLine.length > 0) {
                lines.push(currentLine.trimEnd());
                currentLine = continuationIndent;
            }
            currentLine += part;
        }

        if (currentLine.length > 0) {
            lines.push(currentLine.trimEnd());
        }

        return lines.join('\n');
    }

    private shouldPreserveBlankLine(prevLine: string, nextLine: string): boolean {
        // Preserve blank lines between different sections
        if (this.isBlockStart(prevLine) && this.isBlockStart(nextLine)) {
            return true;
        }

        // Preserve blank lines between major sections
        const majorSectionStarts = [
            /^(system|user|assistant|function):/,
            /^(tools|parameters|then|variables|config):/
        ];

        return majorSectionStarts.some(pattern => pattern.test(nextLine));
    }
}
