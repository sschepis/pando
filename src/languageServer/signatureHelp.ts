import {
  SignatureHelp,
  ParameterInformation,
  SignatureInformation,
  TextDocumentPositionParams
} from 'vscode-languageserver/node';

export function onSignatureHelp(params: TextDocumentPositionParams, documents: any): SignatureHelp {
  const document = documents.get(params.textDocument.uri);
  if (!document) return { signatures: [], activeSignature: undefined, activeParameter: undefined };

  const text = document.getText();
  const lines = text.split('\n');
  const currentLine = lines[params.position.line];
  const linePrefix = currentLine.substr(0, params.position.character);

  if (linePrefix.includes('tool') && linePrefix.endsWith('(')) {
    const signature = SignatureInformation.create(
      'tool(name: string, description: string, parameters: string[])',
      'Defines a tool in Pando'
    );
    signature.parameters = [
      ParameterInformation.create('name: string', 'The name of the tool'),
      ParameterInformation.create('description: string', 'A description of what the tool does'),
      ParameterInformation.create('parameters: string[]', 'An array of parameter names for the tool')
    ];
    return {
      signatures: [signature],
      activeSignature: 0,
      activeParameter: 0
    };
  }

  if (linePrefix.includes('action') && linePrefix.endsWith('(')) {
    const signature = SignatureInformation.create(
      'action(do: string)',
      'Defines an action in Pando'
    );
    signature.parameters = [
      ParameterInformation.create('do: string', 'The action to be performed')
    ];
    return {
      signatures: [signature],
      activeSignature: 0,
      activeParameter: 0
    };
  }

  return { signatures: [], activeSignature: undefined, activeParameter: undefined };
}
