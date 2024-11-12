import {
  Hover,
  TextDocumentPositionParams
} from 'vscode-languageserver/node';

const pandoKeywords = ['prompt', 'input', 'output', 'tool', 'condition', 'action'];

export function onHover(params: TextDocumentPositionParams, documents: any): Hover | undefined {
  const document = documents.get(params.textDocument.uri);
  if (!document) return undefined;

  const offset = document.offsetAt(params.position);
  const text = document.getText();
  const word = text.substr(offset, text.indexOf(' ', offset) - offset);

  if (pandoKeywords.includes(word)) {
    return {
      contents: {
        kind: 'markdown',
        value: `**${word}**\n\nA Pando language keyword used to define a ${word}.`
      }
    };
  }

  return undefined;
}
