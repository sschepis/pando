import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LanguageServerError } from '../errors';

export function validateDocument(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const text = document.getText();

    try {
        // Basic syntax validation
        validateSyntax(text, diagnostics, document);

        // Structure validation
        validateStructure(text, diagnostics, document);

        return diagnostics;
    } catch (error: unknown) {
        throw new LanguageServerError(
            `Error validating document: ${error instanceof Error ? error.message : String(error)}`,
            error
        );
    }
}

function validateSyntax(text: string, diagnostics: Diagnostic[], document: TextDocument) {
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        try {
            // Check for unclosed brackets
            const openBrackets = (line.match(/\{/g) || []).length;
            const closeBrackets = (line.match(/\}/g) || []).length;
            
            if (openBrackets !== closeBrackets) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: Range.create(i, 0, i, line.length),
                    message: 'Mismatched brackets',
                    source: 'pando'
                });
            }

            // Check for invalid characters
            const invalidChars = line.match(/[^\w\s\{\}\[\]\(\):"'.,\-+*/\\?!@#$%^&=<>]/g);
            if (invalidChars) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: Range.create(i, 0, i, line.length),
                    message: `Invalid characters found: ${invalidChars.join(', ')}`,
                    source: 'pando'
                });
            }
        } catch (error: unknown) {
            throw new LanguageServerError(
                `Error in syntax validation: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }
}

function validateStructure(text: string, diagnostics: Diagnostic[], document: TextDocument) {
    try {
        // Check for required sections
        if (!text.includes('system:')) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: Range.create(0, 0, 0, 0),
                message: 'Missing required "system:" section',
                source: 'pando'
            });
        }

        if (!text.includes('user:')) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: Range.create(0, 0, 0, 0),
                message: 'Missing required "user:" section',
                source: 'pando'
            });
        }

        // Check section order
        const sections = text.match(/^(system|user|assistant|function):/gm) || [];
        const expectedOrder = ['system', 'user', 'assistant', 'function'];
        
        let lastIndex = -1;
        for (const section of sections) {
            const sectionName = section.replace(':', '');
            const currentIndex = expectedOrder.indexOf(sectionName);
            
            if (currentIndex < lastIndex) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: Range.create(0, 0, 0, 0),
                    message: `Unexpected section order: "${sectionName}" should come before "${expectedOrder[lastIndex]}"`,
                    source: 'pando'
                });
            }
            lastIndex = currentIndex;
        }
    } catch (error: unknown) {
        throw new LanguageServerError(
            `Error in structure validation: ${error instanceof Error ? error.message : String(error)}`,
            error
        );
    }
}
