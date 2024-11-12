import { AIAssistantDebugAdapter } from '../adapter';
import { DebugError } from '../../errors';

interface Variable {
    name: string;
    value: string;
    type?: string;
    variablesReference: number;
    namedVariables?: number;
    indexedVariables?: number;
    expensive?: boolean;
    evaluateName?: string;
}

let variableHandles = new Map<number, { name: string; value: any }>();
let nextVariableReference = 1;

export function variablesRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const debuggerInterface = adapter.getDebuggerInterface();
        const variables = debuggerInterface.getVariables();
        const variablesReference = request.arguments.variablesReference;

        let variablesToReturn: Variable[] = [];

        if (variablesReference === 0) {
            // Return top-level variables
            variablesToReturn = Object.entries(variables).map(([name, value]) => 
                createVariable(name, value)
            );
        } else {
            // Return nested object properties
            const varHandle = variableHandles.get(variablesReference);
            if (varHandle) {
                variablesToReturn = getNestedVariables(varHandle.value, varHandle.name);
            }
        }

        adapter.sendResponse({
            type: 'response',
            request_seq: request.seq,
            success: true,
            command: request.command,
            body: {
                variables: variablesToReturn
            }
        });
    } catch (error) {
        handleVariablesError(adapter, request, error);
    }
}

function createVariable(name: string, value: any, parent?: string): Variable {
    const type = getVariableType(value);
    const formatted = formatVariableValue(value, type);
    const evaluateName = parent ? `${parent}.${name}` : name;

    let variablesReference = 0;
    let namedVariables: number | undefined;
    let indexedVariables: number | undefined;

    if (value !== null && typeof value === 'object') {
        variablesReference = nextVariableReference++;
        variableHandles.set(variablesReference, { name: evaluateName, value });

        if (Array.isArray(value)) {
            indexedVariables = value.length;
        } else {
            namedVariables = Object.keys(value).length;
        }
    }

    return {
        name,
        value: formatted,
        type,
        variablesReference,
        namedVariables,
        indexedVariables,
        evaluateName,
        expensive: isExpensiveVariable(value)
    };
}

function getNestedVariables(obj: any, parent: string): Variable[] {
    if (Array.isArray(obj)) {
        return obj.map((value, index) => 
            createVariable(`[${index}]`, value, parent)
        );
    }

    return Object.entries(obj).map(([prop, value]) =>
        createVariable(prop, value, parent)
    );
}

function getVariableType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (value instanceof RegExp) return 'regexp';
    if (value instanceof Error) return 'error';
    if (typeof value === 'object') return 'object';
    return typeof value;
}

function formatVariableValue(value: any, type: string): string {
    try {
        switch (type) {
            case 'null':
                return 'null';
            case 'undefined':
                return 'undefined';
            case 'array':
                return `Array(${value.length})`;
            case 'date':
                return value.toISOString();
            case 'regexp':
                return value.toString();
            case 'error':
                return `${value.name}: ${value.message}`;
            case 'object':
                return formatObjectPreview(value);
            case 'string':
                return `"${escapeString(value)}"`;
            case 'number':
            case 'boolean':
                return String(value);
            case 'function':
                return formatFunctionPreview(value);
            default:
                return String(value);
        }
    } catch (error) {
        return '<error formatting value>';
    }
}

function formatObjectPreview(obj: object): string {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    
    const preview = keys.slice(0, 3).map(key => {
        const value = (obj as any)[key];
        const formatted = formatPreviewValue(value);
        return `${key}: ${formatted}`;
    }).join(', ');

    return `{ ${preview}${keys.length > 3 ? ', ...' : ''} }`;
}

function formatPreviewValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${escapeString(value)}"`;
    if (typeof value === 'object') return value.constructor.name || 'Object';
    return String(value);
}

function formatFunctionPreview(func: Function): string {
    const funcStr = func.toString();
    const firstLine = funcStr.split('\n')[0];
    if (firstLine.length > 50) {
        return firstLine.substring(0, 47) + '...';
    }
    return firstLine;
}

function escapeString(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

function isExpensiveVariable(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value !== 'object') return false;
    
    // Consider arrays with more than 100 elements expensive
    if (Array.isArray(value) && value.length > 100) return true;
    
    // Consider objects with more than 50 properties expensive
    if (Object.keys(value).length > 50) return true;
    
    return false;
}

function handleVariablesError(adapter: AIAssistantDebugAdapter, request: any, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success: false,
        command: request.command,
        message: `Failed to get variables: ${errorMessage}`
    });

    throw new DebugError(`Variables request failed: ${errorMessage}`);
}

// Clean up variable handles periodically
setInterval(() => {
    variableHandles.clear();
    nextVariableReference = 1;
}, 5 * 60 * 1000); // Clean up every 5 minutes
