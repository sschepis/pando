import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams
} from 'vscode-languageserver/node';

const pandoKeywords = ['prompt', 'input', 'output', 'tool', 'condition', 'action'];
const pandoStructures: { [key: string]: string[] } = {
  'prompt': ['input', 'output', 'tool', 'condition', 'action'],
  'input': ['format'],
  'output': ['format'],
  'tool': ['name', 'description', 'parameters'],
  'condition': ['if', 'then', 'else'],
  'action': ['do']
};

export function onCompletion(textDocumentPosition: TextDocumentPositionParams, documents: any): CompletionItem[] {
  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const offset = document.offsetAt(textDocumentPosition.position);
  const linePrefix = text.substr(0, offset).split('\n').pop() || '';

  if (linePrefix.trim() === '') {
    return pandoKeywords.map(keyword => ({
      label: keyword,
      kind: CompletionItemKind.Keyword,
      data: keyword
    }));
  }

  const lastWord = linePrefix.trim().split(/\s+/).pop() || '';
  if (pandoStructures[lastWord]) {
    return pandoStructures[lastWord].map((subKeyword: string) => ({
      label: subKeyword,
      kind: CompletionItemKind.Property,
      data: `${lastWord}.${subKeyword}`
    }));
  }

  return [];
}

export function onCompletionResolve(item: CompletionItem): CompletionItem {
  const data = item.data as string;
  if (pandoKeywords.includes(data)) {
    item.detail = `Pando ${data} keyword`;
    item.documentation = `Defines a ${data} in the Pando language.`;
  } else if (data.includes('.')) {
    const [parent, child] = data.split('.');
    item.detail = `${parent} ${child}`;
    item.documentation = `A ${child} within a ${parent} structure.`;
  }
  return item;
}
