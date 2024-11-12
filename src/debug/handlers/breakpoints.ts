import { AIAssistantDebugAdapter } from '../adapter';
import { DebuggerInterface } from '../../types/DebuggerInterface';

interface Breakpoint {
    verified: boolean;
    line: number;
}

export async function handleBreakpointsRequest(adapter: AIAssistantDebugAdapter, args: any): Promise<void> {
    const debuggerInterface = adapter.getDebuggerInterface();
    const breakpoints = args.breakpoints || [];
    const verifiedBreakpoints: Breakpoint[] = [];

    for (const bp of breakpoints) {
        debuggerInterface.setBreakpoint(bp.line);
        verifiedBreakpoints.push({
            verified: true,
            line: bp.line
        });
    }

    adapter.sendResponse({
        body: {
            breakpoints: verifiedBreakpoints
        }
    });
}
