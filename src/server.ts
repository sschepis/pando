import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    TextDocumentChangeEvent,
    Diagnostic
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateDocument } from './languageServer/validation';
import { onCompletion, onCompletionResolve } from './languageServer/completion';
import { onDocumentSymbol } from './languageServer/symbols';
import { onFoldingRanges } from './languageServer/foldingRanges';
import { onHover } from './languageServer/hover';
import { onRenameRequest } from './languageServer/rename';
import { onSignatureHelp } from './languageServer/signatureHelp';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.', '"', '\'', '{', '[', '(']
            },
            hoverProvider: true,
            documentSymbolProvider: true,
            foldingRangeProvider: true,
            renameProvider: true,
            signatureHelpProvider: {
                triggerCharacters: ['(', ',']
            }
        }
    };
    return result;
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
    try {
        const diagnostics = validateDocument(change.document);
        connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
    } catch (error) {
        connection.console.error(`Error validating document: ${error instanceof Error ? error.message : String(error)}`);
    }
});

// Register handlers for language features
connection.onCompletion(onCompletion);
connection.onCompletionResolve(onCompletionResolve);
connection.onDocumentSymbol(onDocumentSymbol);
connection.onFoldingRanges(onFoldingRanges);
connection.onHover(onHover);
connection.onRenameRequest(onRenameRequest);
connection.onSignatureHelp(onSignatureHelp);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
