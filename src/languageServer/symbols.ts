import {
  DocumentSymbolParams,
  SymbolInformation,
  SymbolKind
} from 'vscode-languageserver/node';

const pandoKeywords = ['prompt', 'input', 'output', 'tool', 'condition', 'action'];

export function onDocumentSymbol(params: DocumentSymbolParams, documents: any): SymbolInformation[] {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const lines = text.split('\n');
  const symbols: SymbolInformation[] = [];

  lines.forEach((line: string, lineIndex: number) => {
    const trimmedLine = line.trim();
    pandoKeywords.forEach(keyword => {
      if (trimmedLine.startsWith(keyword)) {
        const name = trimmedLine.split(/\s+/)[1] || keyword;
        symbols.push(SymbolInformation.create(
          name,
          SymbolKind.Class,
          { start: { line: lineIndex, character: 0 }, end: { line: lineIndex, character: line.length } },
          params.textDocument.uri
        ));
      }
    });
  });

  return symbols;
}
