import {
    RenameParams,
    WorkspaceEdit,
    TextEdit
} from 'vscode-languageserver/node';

const pandoKeywords = ['prompt', 'input', 'output', 'tool', 'condition', 'action'];

export function onRenameRequest(params: RenameParams, documents: any): WorkspaceEdit | null {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;

    const text = document.getText();
    const lines = text.split('\n');
    const changes: { [uri: string]: TextEdit[] } = {};

    lines.forEach((line: string, lineIndex: number) => {
        const trimmedLine = line.trim();
        pandoKeywords.forEach(keyword => {
            if (trimmedLine.startsWith(keyword)) {
                const words = trimmedLine.split(/\s+/);
                if (words[1] === params.position.character.toString()) {
                    changes[params.textDocument.uri] = [{
                        range: {
                            start: { line: lineIndex, character: line.indexOf(words[1]) },
                            end: { line: lineIndex, character: line.indexOf(words[1]) + words[1].length }
                        },
                        newText: params.newName
                    }];
                }
            }
        });
    });

    return { changes };
}
