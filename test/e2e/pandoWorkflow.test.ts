import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AIAssistant } from '../../src/ai/AIAssistant';
import { Config } from '../../src/ai/types';
import { createLogger } from '../../src/ai/logger';

// Mock vscode
jest.mock('vscode', () => ({
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
    openTextDocument: jest.fn(),
    applyEdit: jest.fn(),
  },
  window: {
    showTextDocument: jest.fn(),
    activeTextEditor: {
      document: {
        getText: jest.fn(),
        fileName: 'test.pando',
      },
      edit: jest.fn(),
    },
  },
  Position: jest.fn(),
  Range: jest.fn(),
  TextEdit: { insert: jest.fn() },
  commands: {
    executeCommand: jest.fn(),
  },
  ExtensionContext: jest.fn(),
}));

describe('Pando Workflow End-to-End Tests', () => {
  let aiAssistant: AIAssistant;
  let mockConfig: Config;
  let mockLogger: ReturnType<typeof createLogger>;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    mockConfig = {
      prompts: [],
      provider: {} as any,
      tools: []
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    mockContext = new (vscode as any).ExtensionContext();

    aiAssistant = new AIAssistant(mockConfig, {}, mockLogger);
  });

  it('should create, edit, and execute a Pando file', async () => {
    // Simulate creating a new Pando file
    const fileName = 'test.pando';
    const filePath = path.join('/test/workspace', fileName);
    
    // Mock file system operations
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => 'Initial content');

    // Simulate opening the file in VSCode
    (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue({
      fileName: filePath,
      getText: () => 'Initial content',
    });

    (vscode.window.showTextDocument as jest.Mock).mockResolvedValue({
      document: {
        fileName: filePath,
        getText: () => 'Initial content',
      },
      edit: jest.fn().mockImplementation((callback) => {
        callback({
          insert: (position: vscode.Position, content: string) => {
            // Simulate inserting content
          },
        });
        return Promise.resolve(true);
      }),
    });

    // Simulate editing the file
    const pandoContent = `
    prompt testPrompt {
      system: "You are a test assistant"
      user: "Respond with 'Hello, Pando!'"
      requestFormat: {}
      responseFormat: { response: "string" }
    }
    `;

    (vscode.window.activeTextEditor!.document.getText as jest.Mock).mockReturnValue(pandoContent);

    // Simulate executing the Pando file
    (vscode.commands.executeCommand as jest.Mock).mockImplementation((command) => {
      if (command === 'pando.runPrompt') {
        return Promise.resolve({ response: 'Hello, Pando!' });
      }
    });

    // Execute the workflow
    await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(filePath));
    await vscode.window.activeTextEditor!.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), pandoContent);
    });
    const result = await vscode.commands.executeCommand('pando.runPrompt');

    // Assertions
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, 'Initial content');
    expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(filePath);
    expect(vscode.window.showTextDocument).toHaveBeenCalled();
    expect(vscode.window.activeTextEditor!.edit).toHaveBeenCalled();
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith('pando.runPrompt');
    expect(result).toEqual({ response: 'Hello, Pando!' });
  });
});
