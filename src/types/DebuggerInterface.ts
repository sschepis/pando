import { PromptRunner } from '../utils/promptRunner';

export class DebuggerInterface {
    private promptRunner: PromptRunner;
    private breakpoints: Set<number> = new Set();
    private currentLine: number = 0;
    private isPaused: boolean = false;
    private promptContent: string = '';
    private promptLines: string[] = [];
    private variables: { [key: string]: any } = {};

    constructor(promptRunner: PromptRunner) {
        this.promptRunner = promptRunner;
    }

    loadPrompt(content: string): void {
        this.promptContent = content;
        this.promptLines = content.split('\n');
        this.currentLine = 0;
        this.isPaused = false;
        this.variables = {};
    }

    setBreakpoint(line: number): void {
        this.breakpoints.add(line);
    }

    removeBreakpoint(line: number): void {
        this.breakpoints.delete(line);
    }

    continue(): void {
        this.isPaused = false;
        this.executeLine();
    }

    stepOver(): void {
        this.currentLine++;
        this.executeLine();
    }

    stepIn(): void {
        // For now, this is the same as stepOver
        this.stepOver();
    }

    stepOut(): void {
        // For now, this is the same as continue
        this.continue();
    }

    pause(): void {
        this.isPaused = true;
    }

    getVariables(): { [key: string]: any } {
        return this.variables;
    }

    setVariable(name: string, value: any): void {
        this.variables[name] = value;
    }

    getCallStack(): string[] {
        // For now, we'll just return the current line
        return [`Line ${this.currentLine + 1}`];
    }

    isAtBreakpoint(): boolean {
        return this.breakpoints.has(this.currentLine);
    }

    getCurrentLine(): number {
        return this.currentLine;
    }

    isPausedState(): boolean {
        return this.isPaused;
    }

    private async executeLine(): Promise<void> {
        while (this.currentLine < this.promptLines.length && !this.isPaused) {
            const line = this.promptLines[this.currentLine].trim();
            
            if (this.isAtBreakpoint()) {
                this.isPaused = true;
                break;
            }

            if (line.startsWith('$')) {
                // This is a variable assignment
                const [varName, ...varValueParts] = line.substring(1).split('=');
                const varValue = varValueParts.join('=').trim();
                this.setVariable(varName.trim(), varValue);
            } else if (line) {
                // This is a prompt to be executed
                try {
                    const result = await this.promptRunner.runPrompt(this.replaceVariables(line));
                    // Store the result in a special variable
                    this.setVariable('_lastResult', result);
                } catch (error) {
                    console.error(`Error executing line ${this.currentLine + 1}: ${error}`);
                    this.isPaused = true;
                    break;
                }
            }

            this.currentLine++;
        }

        if (this.currentLine >= this.promptLines.length) {
            // End of prompt reached
            this.isPaused = true;
        }
    }

    private replaceVariables(line: string): string {
        return line.replace(/\$(\w+)/g, (match, varName) => {
            return this.variables[varName] || match;
        });
    }
}
