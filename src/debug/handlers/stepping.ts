 import { AIAssistantDebugAdapter } from '../adapter';
import { DebugError } from '../../errors';

interface SteppingState {
    lastPosition?: {
        line: number;
        column: number;
    };
    stepCount: number;
    stepIntoTarget?: string;
    stepOutDepth?: number;
}

const steppingState: SteppingState = {
    stepCount: 0
};

export function continueRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const debuggerInterface = adapter.getDebuggerInterface();
        const startLine = debuggerInterface.getCurrentLine();

        // Reset stepping state
        resetSteppingState();

        // Start execution
        debuggerInterface.continue();

        // Get current position after continue
        const currentLine = debuggerInterface.getCurrentLine();
        const variables = debuggerInterface.getVariables();

        // Check if execution has stopped
        if (debuggerInterface.isPausedState()) {
            sendStoppedEvent(adapter, 'breakpoint', currentLine, startLine);
        } else {
            // Execution completed
            adapter.sendEvent('terminated', { restart: false });
        }

        // Send success response
        sendSteppingResponse(adapter, request, true);
    } catch (error) {
        handleSteppingError(adapter, request, 'continue', error);
    }
}

export function nextRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const debuggerInterface = adapter.getDebuggerInterface();
        const startLine = debuggerInterface.getCurrentLine();

        // Track step count
        steppingState.stepCount++;
        steppingState.lastPosition = {
            line: startLine,
            column: 0 // Column information might be added in future
        };

        // Execute step over
        debuggerInterface.stepOver();

        // Get new position
        const currentLine = debuggerInterface.getCurrentLine();

        if (debuggerInterface.isPausedState()) {
            const reason = debuggerInterface.isAtBreakpoint() ? 'breakpoint' : 'step';
            sendStoppedEvent(adapter, reason, currentLine, startLine);
        } else {
            adapter.sendEvent('terminated', { restart: false });
        }

        sendSteppingResponse(adapter, request, true);
    } catch (error) {
        handleSteppingError(adapter, request, 'next', error);
    }
}

export function stepInRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const debuggerInterface = adapter.getDebuggerInterface();
        const startLine = debuggerInterface.getCurrentLine();

        // Track step in target if specified
        if (request.arguments?.targetId) {
            steppingState.stepIntoTarget = request.arguments.targetId;
        }

        debuggerInterface.stepIn();

        const currentLine = debuggerInterface.getCurrentLine();

        if (debuggerInterface.isPausedState()) {
            sendStoppedEvent(adapter, 'step', currentLine, startLine);
        } else {
            adapter.sendEvent('terminated', { restart: false });
        }

        sendSteppingResponse(adapter, request, true);
    } catch (error) {
        handleSteppingError(adapter, request, 'stepIn', error);
    }
}

export function stepOutRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const debuggerInterface = adapter.getDebuggerInterface();
        const startLine = debuggerInterface.getCurrentLine();

        // Track current depth for step out
        steppingState.stepOutDepth = debuggerInterface.getCallStack().length;

        debuggerInterface.stepOut();

        const currentLine = debuggerInterface.getCurrentLine();

        if (debuggerInterface.isPausedState()) {
            sendStoppedEvent(adapter, 'step', currentLine, startLine);
        } else {
            adapter.sendEvent('terminated', { restart: false });
        }

        sendSteppingResponse(adapter, request, true);
    } catch (error) {
        handleSteppingError(adapter, request, 'stepOut', error);
    }
}

function sendStoppedEvent(
    adapter: AIAssistantDebugAdapter,
    reason: string,
    currentLine: number,
    startLine: number
) {
    const debuggerInterface = adapter.getDebuggerInterface();
    const variables = debuggerInterface.getVariables();
    
    adapter.sendEvent('stopped', {
        reason,
        threadId: 1,
        allThreadsStopped: true,
        description: getStoppedDescription(reason, currentLine, startLine),
        text: getStoppedText(variables),
        hitBreakpointIds: reason === 'breakpoint' ? [currentLine] : undefined
    });
}

function getStoppedDescription(reason: string, currentLine: number, startLine: number): string {
    switch (reason) {
        case 'step':
            return `Paused on line ${currentLine}${startLine !== currentLine ? ` (from line ${startLine})` : ''}`;
        case 'breakpoint':
            return `Hit breakpoint on line ${currentLine}`;
        case 'exception':
            return `Paused on exception at line ${currentLine}`;
        default:
            return `Paused at line ${currentLine}`;
    }
}

function getStoppedText(variables: Record<string, any>): string {
    const relevantVars = Object.entries(variables)
        .filter(([key, value]) => !key.startsWith('_'))
        .map(([key, value]) => `${key}: ${formatValue(value)}`)
        .join(', ');
    
    return relevantVars ? `Variables: ${relevantVars}` : 'No variables to display';
}

function formatValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
        return '{...}'; // Simplified object representation
    }
    return String(value);
}

function sendSteppingResponse(adapter: AIAssistantDebugAdapter, request: any, success: boolean) {
    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success,
        command: request.command
    });
}

function handleSteppingError(adapter: AIAssistantDebugAdapter, request: any, operation: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success: false,
        command: request.command,
        message: `Failed to execute ${operation}: ${errorMessage}`
    });

    adapter.sendEvent('error', {
        error: errorMessage,
        operation
    });

    throw new DebugError(`Stepping operation '${operation}' failed: ${errorMessage}`);
}

function resetSteppingState() {
    steppingState.lastPosition = undefined;
    steppingState.stepCount = 0;
    steppingState.stepIntoTarget = undefined;
    steppingState.stepOutDepth = undefined;
}
