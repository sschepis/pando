import { AIAssistantDebugAdapter } from '../adapter';
import { DebugError } from '../../errors';

interface Scope {
    name: string;
    variablesReference: number;
    expensive: boolean;
    namedVariables?: number;
    indexedVariables?: number;
    source?: string;
    line?: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
}

// Keep track of scope references
let scopeHandles = new Map<number, { type: string; frameId: number }>();
let nextScopeReference = 1000; // Start at 1000 to avoid conflicts with variable references

export function scopesRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const debuggerInterface = adapter.getDebuggerInterface();
        const frameId = request.arguments.frameId;
        const scopes: Scope[] = [];

        // Add local scope
        const localScope = createLocalScope(debuggerInterface, frameId);
        scopes.push(localScope);

        // Add global scope
        const globalScope = createGlobalScope(debuggerInterface, frameId);
        scopes.push(globalScope);

        // Add special scopes based on context
        addSpecialScopes(scopes, debuggerInterface, frameId);

        adapter.sendResponse({
            type: 'response',
            request_seq: request.seq,
            success: true,
            command: request.command,
            body: {
                scopes
            }
        });
    } catch (error) {
        handleScopesError(adapter, request, error);
    }
}

function createLocalScope(debuggerInterface: any, frameId: number): Scope {
    const variables = debuggerInterface.getVariables();
    const localVars = filterLocalVariables(variables);
    const scopeRef = createScopeReference('local', frameId);

    return {
        name: 'Local',
        variablesReference: scopeRef,
        expensive: false,
        namedVariables: Object.keys(localVars).length,
        source: getCurrentSource(debuggerInterface),
        line: debuggerInterface.getCurrentLine(),
        column: 0 // Column information might be added in future
    };
}

function createGlobalScope(debuggerInterface: any, frameId: number): Scope {
    const variables = debuggerInterface.getVariables();
    const globalVars = filterGlobalVariables(variables);
    const scopeRef = createScopeReference('global', frameId);

    return {
        name: 'Global',
        variablesReference: scopeRef,
        expensive: true,
        namedVariables: Object.keys(globalVars).length
    };
}

function addSpecialScopes(scopes: Scope[], debuggerInterface: any, frameId: number) {
    // Add closure scope if available
    const closureVars = getClosureVariables(debuggerInterface);
    if (Object.keys(closureVars).length > 0) {
        const closureScopeRef = createScopeReference('closure', frameId);
        scopes.push({
            name: 'Closure',
            variablesReference: closureScopeRef,
            expensive: false,
            namedVariables: Object.keys(closureVars).length
        });
    }

    // Add state scope for debugging state
    const stateVars = getStateVariables(debuggerInterface);
    if (Object.keys(stateVars).length > 0) {
        const stateScopeRef = createScopeReference('state', frameId);
        scopes.push({
            name: 'State',
            variablesReference: stateScopeRef,
            expensive: false,
            namedVariables: Object.keys(stateVars).length
        });
    }
}

function filterLocalVariables(variables: Record<string, any>): Record<string, any> {
    return Object.entries(variables).reduce((acc, [key, value]) => {
        // Consider variables that don't start with '_' as local
        if (!key.startsWith('_') && !isGlobalVariable(key)) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);
}

function filterGlobalVariables(variables: Record<string, any>): Record<string, any> {
    return Object.entries(variables).reduce((acc, [key, value]) => {
        if (isGlobalVariable(key)) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);
}

function getClosureVariables(debuggerInterface: any): Record<string, any> {
    // Implementation depends on how closures are tracked in the debugger
    const closures = debuggerInterface.getClosures?.() || {};
    return closures;
}

function getStateVariables(debuggerInterface: any): Record<string, any> {
    // Get debugging state variables
    const state = {
        currentLine: debuggerInterface.getCurrentLine(),
        isPaused: debuggerInterface.isPausedState(),
        hasBreakpoint: debuggerInterface.isAtBreakpoint(),
        callStack: debuggerInterface.getCallStack()
    };

    return state;
}

function isGlobalVariable(name: string): boolean {
    // Define criteria for global variables
    const globalPrefixes = ['global_', 'GLOBAL_', 'g_'];
    return globalPrefixes.some(prefix => name.startsWith(prefix)) ||
           name === name.toUpperCase(); // Consider all-caps names as globals
}

function getCurrentSource(debuggerInterface: any): string {
    try {
        const callStack = debuggerInterface.getCallStack();
        return callStack[0] || 'unknown';
    } catch {
        return 'unknown';
    }
}

function createScopeReference(type: string, frameId: number): number {
    const reference = nextScopeReference++;
    scopeHandles.set(reference, { type, frameId });
    return reference;
}

function handleScopesError(adapter: AIAssistantDebugAdapter, request: any, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success: false,
        command: request.command,
        message: `Failed to get scopes: ${errorMessage}`
    });

    throw new DebugError(`Scopes request failed: ${errorMessage}`);
}

// Clean up scope handles periodically
setInterval(() => {
    scopeHandles.clear();
    nextScopeReference = 1000;
}, 5 * 60 * 1000); // Clean up every 5 minutes
