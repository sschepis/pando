import { AIAssistantDebugAdapter } from '../adapter';

export function stackTraceRequest(adapter: AIAssistantDebugAdapter, request: any) {
    const debuggerInterface = adapter.getDebuggerInterface();
    const currentLine = debuggerInterface.getCurrentLine();
    const stackFrames = [
        {
            id: 1,
            name: 'Pando Prompt',
            source: {
                name: 'prompt.pando',
                path: request.arguments.source?.path || 'prompt.pando'
            },
            line: currentLine,
            column: 0
        }
    ];

    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success: true,
        command: request.command,
        body: {
            stackFrames: stackFrames,
            totalFrames: 1
        }
    });
}
