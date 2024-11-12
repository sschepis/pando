# Pando VSCode Extension Acceptance Test Plan

## Setup
1. Ensure VSCode is installed and up to date.
2. Install the Pando VSCode extension.
3. Open a new workspace in VSCode.

## Test Cases

### 1. Creating a New Pando File
1. Use the command palette (Ctrl+Shift+P or Cmd+Shift+P) to run the "Pando: New File" command.
2. Enter a name for the new file (e.g., "test_prompt.pando").
3. Verify that a new file is created with the .pando extension and basic prompt structure.

### 2. Syntax Highlighting
1. Open the newly created .pando file.
2. Add content to the file, including different sections like system, user, input, output, tools, etc.
3. Verify that appropriate syntax highlighting is applied to different parts of the file.

### 3. Auto-completion
1. Start typing a new section in the .pando file (e.g., "sys").
2. Verify that auto-completion suggestions appear for known keywords (e.g., "system:").
3. Test auto-completion for tool names and other Pando-specific elements.

### 4. Error Detection
1. Introduce a deliberate error in the .pando file (e.g., misspell a keyword or omit a required section).
2. Verify that the error is highlighted or underlined in the editor.
3. Hover over the error to check if an appropriate error message is displayed.

### 5. Running a Pando Prompt
1. Create a valid Pando prompt in the .pando file.
2. Use the command palette to run the "Pando: Run Prompt" command.
3. Verify that the prompt is executed and results are displayed (either in the output panel or as specified in the extension's design).

### 6. Debugging a Pando Prompt
1. Set a breakpoint in the Pando file by clicking on the gutter (left side of the editor).
2. Start debugging the Pando file (F5 or use the Run and Debug sidebar).
3. Verify that execution stops at the breakpoint.
4. Step through the prompt execution, checking variable values and execution flow.

### 7. Integration with Pando
1. Create a prompt that uses the Pando functionality.
2. Run the prompt and verify that the Pando is invoked correctly.
3. Check that the Pando's response is properly integrated into the Pando execution flow.

### 8. Custom Tool Integration
1. Define a custom tool in the Pando file.
2. Use the custom tool in a prompt.
3. Run the prompt and verify that the custom tool is executed correctly.

### 9. Error Handling
1. Create a prompt with deliberate runtime errors (e.g., referencing undefined variables).
2. Run the prompt and verify that appropriate error messages are displayed.
3. Check that the error doesn't crash the extension and that you can continue working after an error occurs.

### 10. Performance Test
1. Create a large Pando file with multiple prompts and tools.
2. Run the file and verify that the extension handles it without significant lag or freezing.

### 11. Multi-file Support
1. Create multiple .pando files in the workspace.
2. Verify that you can switch between files and that syntax highlighting, auto-completion, and other features work correctly for all files.

### 12. Extension Settings
1. Open VSCode settings and locate the Pando extension settings.
2. Modify some settings (if available, e.g., AI provider, default prompt template).
3. Verify that the changes take effect in the extension's behavior.

## Conclusion
After completing all test cases, document any bugs, unexpected behaviors, or areas for improvement. Provide overall feedback on the user experience and any suggestions for enhancing the extension's functionality or usability.
