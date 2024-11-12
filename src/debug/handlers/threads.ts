import { AIAssistantDebugAdapter } from '../adapter';
import { DebugError } from '../../errors';

interface Thread {
    id: number;
    name: string;
    state?: 'running' | 'stopped' | 'paused' | 'terminated';
    details?: string;
}

// Thread state management
const threads = new Map<number, Thread>();
const MAIN_THREAD_ID = 1;

// Initialize main thread
threads.set(MAIN_THREAD_ID, {
    id: MAIN_THREAD_ID,
    name: 'Main Thread',
    state: 'stopped'
});

export function threadsRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const debuggerInterface = adapter.getDebuggerInterface();
        updateThreadStates(debuggerInterface);

        const threadList = Array.from(threads.values()).map(thread => ({
            id: thread.id,
            name: formatThreadName(thread)
        }));

        adapter.sendResponse({
            type: 'response',
            request_seq: request.seq,
            success: true,
            command: request.command,
            body: {
                threads: threadList
            }
        });
    } catch (error) {
        handleThreadsError(adapter, request, error);
    }
}

export function updateThreadState(threadId: number, newState: Thread['state'], details?: string) {
    const thread = threads.get(threadId);
    if (thread) {
        thread.state = newState;
        thread.details = details;
    }
}

function updateThreadStates(debuggerInterface: any) {
    const mainThread = threads.get(MAIN_THREAD_ID)!;

    // Update main thread state based on debugger state
    if (debuggerInterface.isPausedState()) {
        mainThread.state = 'paused';
        if (debuggerInterface.isAtBreakpoint()) {
            mainThread.details = `Paused at breakpoint on line ${debuggerInterface.getCurrentLine()}`;
        } else {
            mainThread.details = `Paused on line ${debuggerInterface.getCurrentLine()}`;
        }
    } else {
        const variables = debuggerInterface.getVariables();
        if (variables._lastResult?.taskCompleted) {
            mainThread.state = 'terminated';
            mainThread.details = 'Execution completed';
        } else {
            mainThread.state = 'running';
            mainThread.details = undefined;
        }
    }
}

function formatThreadName(thread: Thread): string {
    let name = thread.name;
    
    // Add state information if available
    if (thread.state && thread.state !== 'running') {
        name += ` (${thread.state})`;
    }

    // Add details if available
    if (thread.details) {
        name += ` - ${thread.details}`;
    }

    return name;
}

export function handleThreadStart(adapter: AIAssistantDebugAdapter) {
    updateThreadState(MAIN_THREAD_ID, 'running');
    sendThreadEvent(adapter, 'started', MAIN_THREAD_ID);
}

export function handleThreadStop(adapter: AIAssistantDebugAdapter, reason: string, description?: string) {
    updateThreadState(MAIN_THREAD_ID, 'stopped', description);
    sendThreadEvent(adapter, 'stopped', MAIN_THREAD_ID, reason);
}

export function handleThreadExit(adapter: AIAssistantDebugAdapter, exitCode?: number) {
    updateThreadState(MAIN_THREAD_ID, 'terminated', exitCode !== undefined ? `Exit code: ${exitCode}` : undefined);
    sendThreadEvent(adapter, 'exited', MAIN_THREAD_ID, undefined, exitCode);
}

function sendThreadEvent(
    adapter: AIAssistantDebugAdapter,
    event: 'started' | 'stopped' | 'exited',
    threadId: number,
    reason?: string,
    exitCode?: number
) {
    const thread = threads.get(threadId);
    if (!thread) return;

    const eventBody: any = {
        threadId,
        name: thread.name
    };

    if (reason) {
        eventBody.reason = reason;
    }

    if (exitCode !== undefined) {
        eventBody.exitCode = exitCode;
    }

    if (thread.details) {
        eventBody.description = thread.details;
    }

    adapter.sendEvent(event, eventBody);
}

function handleThreadsError(adapter: AIAssistantDebugAdapter, request: any, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success: false,
        command: request.command,
        message: `Failed to get threads: ${errorMessage}`
    });

    throw new DebugError(`Threads request failed: ${errorMessage}`);
}

// Export thread management functions for use by other handlers
export const threadManager = {
    updateThreadState,
    handleThreadStart,
    handleThreadStop,
    handleThreadExit
};
