import {
  FoldingRangeParams,
  FoldingRange
} from 'vscode-languageserver/node';

export function onFoldingRanges(params: FoldingRangeParams, documents: any): FoldingRange[] {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const lines = text.split('\n');
  const foldingRanges: FoldingRange[] = [];
  const stack: number[] = [];

  lines.forEach((line: string, lineIndex: number) => {
    const trimmedLine = line.trim();
    if (trimmedLine.endsWith('{')) {
      stack.push(lineIndex);
    } else if (trimmedLine === '}' && stack.length > 0) {
      const startLine = stack.pop()!;
      foldingRanges.push(FoldingRange.create(startLine, lineIndex));
    }
  });

  return foldingRanges;
}
