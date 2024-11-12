import { Config } from "../types";

// Simple logger that works in both VSCode and non-VSCode environments
const logger = {
    error: console.error,
    warn: console.warn,
    info: console.log,
    debug: console.log,
};

export interface ProcessState {
    [key: string]: any;
}

export interface ProcessStep {
    type: 'prompt' | 'tool';
    name: string;
    execute: (state: ProcessState) => Promise<any>;
}

export interface Process {
    name: string;
    primaryTask: string;
    steps: ProcessStep[];
    initialState: ProcessState;
    isComplete: (state: ProcessState) => boolean;
}

export class ProcessRunner {
    private process: Process;
    private state: ProcessState;
    private currentStepIndex: number = 0;
    private paused: boolean = false;

    constructor(process: Process) {
        this.process = process;
        this.state = { ...process.initialState };
    }

    async run() {
        while (!this.isComplete() && !this.paused) {
            await this.executeNextStep();
        }
        return this.state;
    }

    async executeNextStep(): Promise<void> {
        if (this.currentStepIndex >= this.process.steps.length) {
            return;
        }

        const step = this.process.steps[this.currentStepIndex];
        
        try {
            await this.executeHook('beforeStep', step);
            const result = await step.execute(this.state);
            this.updateState(result);
            await this.executeHook('afterStep', step);
        } catch (error) {
            logger.error(`Error executing step ${step.name}:`, error);
            throw error;
        }

        this.currentStepIndex++;
    }

    private updateState(result: any): void {
        if (typeof result === 'object' && result !== null) {
            this.state = { ...this.state, ...result };
        }
    }

    isComplete(): boolean {
        return this.process.isComplete(this.state);
    }

    pause(): void {
        this.paused = true;
    }

    resume(): void {
        this.paused = false;
    }

    getState(): ProcessState {
        return { ...this.state };
    }

    private async executeHook(hookName: 'beforeStep' | 'afterStep', step: ProcessStep): Promise<void> {
        const hookMethod = `${hookName}Hook` as keyof ProcessRunner;
        if (typeof this[hookMethod] === 'function') {
            await (this[hookMethod] as Function)(step);
        }
    }

    // Hook methods that can be overridden in subclasses
    protected async beforeStepHook(step: ProcessStep): Promise<void> {}
    protected async afterStepHook(step: ProcessStep): Promise<void> {}
}

// Example of how to create and use a Process
export const createExampleProcess = (): Process => ({
    name: "ExampleProcess",
    primaryTask: "Complete a sample task",
    steps: [
        {
            type: 'prompt',
            name: 'getInitialInput',
            execute: async (state) => {
                // Simulating a prompt execution
                return { initialInput: "Sample input" };
            }
        },
        {
            type: 'tool',
            name: 'processTool',
            execute: async (state) => {
                // Simulating a tool execution
                return { processedData: state.initialInput.toUpperCase() };
            }
        }
    ],
    initialState: {},
    isComplete: (state: ProcessState) => {
        return 'processedData' in state;
    }
});
