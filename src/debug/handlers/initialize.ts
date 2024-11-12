import { AIAssistantDebugAdapter } from '../adapter';
import { DebugError } from '../../errors';

interface InitializeRequestArguments {
    clientID?: string;
    clientName?: string;
    adapterID: string;
    pathFormat?: 'path' | 'uri';
    linesStartAt1?: boolean;
    columnsStartAt1?: boolean;
    supportsVariableType?: boolean;
    supportsVariablePaging?: boolean;
    supportsRunInTerminal?: boolean;
    locale?: string;
    supportsProgressReporting?: boolean;
    supportsInvalidatedEvent?: boolean;
}

interface Capabilities {
    supportsConfigurationDoneRequest?: boolean;
    supportsFunctionBreakpoints?: boolean;
    supportsConditionalBreakpoints?: boolean;
    supportsHitConditionalBreakpoints?: boolean;
    supportsEvaluateForHovers?: boolean;
    exceptionBreakpointFilters?: Array<{
        filter: string;
        label: string;
        description?: string;
        default?: boolean;
    }>;
    supportsStepBack?: boolean;
    supportsSetVariable?: boolean;
    supportsRestartFrame?: boolean;
    supportsGotoTargetsRequest?: boolean;
    supportsStepInTargetsRequest?: boolean;
    supportsCompletionsRequest?: boolean;
    supportsModulesRequest?: boolean;
    additionalModuleColumns?: Array<{
        attributeName: string;
        label: string;
    }>;
    supportedChecksumAlgorithms?: string[];
    supportsRestartRequest?: boolean;
    supportsExceptionOptions?: boolean;
    supportsValueFormattingOptions?: boolean;
    supportsExceptionInfoRequest?: boolean;
    supportTerminateDebuggee?: boolean;
    supportsDelayedStackTraceLoading?: boolean;
    supportsLoadedSourcesRequest?: boolean;
    supportsLogPoints?: boolean;
    supportsTerminateThreadsRequest?: boolean;
    supportsSetExpression?: boolean;
    supportsTerminateRequest?: boolean;
    supportsDataBreakpoints?: boolean;
    supportsReadMemoryRequest?: boolean;
    supportsWriteMemoryRequest?: boolean;
    supportsDisassembleRequest?: boolean;
    supportsCancelRequest?: boolean;
    supportsBreakpointLocationsRequest?: boolean;
    supportsClipboardContext?: boolean;
    supportsSteppingGranularity?: boolean;
    supportsInstructionBreakpoints?: boolean;
    supportsExceptionFilterOptions?: boolean;
}

export function initializeRequest(adapter: AIAssistantDebugAdapter, request: any) {
    try {
        const args = request.arguments as InitializeRequestArguments;
        validateInitializeArguments(args);

        // Configure adapter based on client capabilities
        configureAdapter(adapter, args);

        // Prepare capabilities response
        const capabilities = getDebuggerCapabilities(adapter);

        adapter.sendResponse({
            type: 'response',
            request_seq: request.seq,
            success: true,
            command: request.command,
            body: capabilities
        });

        // Send initialized event
        adapter.sendEvent('initialized', {});
    } catch (error) {
        handleInitializeError(adapter, request, error);
    }
}

function validateInitializeArguments(args: InitializeRequestArguments) {
    if (!args.adapterID) {
        throw new DebugError('adapterID is required in initialize request');
    }

    // Validate path format
    if (args.pathFormat && !['path', 'uri'].includes(args.pathFormat)) {
        throw new DebugError('Invalid pathFormat specified');
    }
}

function configureAdapter(adapter: AIAssistantDebugAdapter, args: InitializeRequestArguments) {
    const debuggerInterface = adapter.getDebuggerInterface();
    const variables = debuggerInterface.getVariables();

    // Configure line and column numbering
    variables.linesStartAt1 = args.linesStartAt1 ?? true;
    variables.columnsStartAt1 = args.columnsStartAt1 ?? true;

    // Store client information
    variables.client = {
        id: args.clientID,
        name: args.clientName,
        locale: args.locale,
        supportsProgressReporting: args.supportsProgressReporting,
        supportsInvalidatedEvent: args.supportsInvalidatedEvent
    };
}

function getDebuggerCapabilities(adapter: AIAssistantDebugAdapter): Capabilities {
    return {
        // Supported features
        supportsConfigurationDoneRequest: true,
        supportsFunctionBreakpoints: true,
        supportsConditionalBreakpoints: true,
        supportsHitConditionalBreakpoints: true,
        supportsEvaluateForHovers: true,
        supportsStepBack: false,
        supportsSetVariable: true,
        supportsRestartFrame: false,
        supportsGotoTargetsRequest: false,
        supportsStepInTargetsRequest: false,
        supportsCompletionsRequest: true,
        supportsModulesRequest: false,
        supportsRestartRequest: true,
        supportsExceptionOptions: true,
        supportsValueFormattingOptions: true,
        supportsExceptionInfoRequest: true,
        supportTerminateDebuggee: true,
        supportsDelayedStackTraceLoading: true,
        supportsLoadedSourcesRequest: true,
        supportsLogPoints: true,
        supportsTerminateThreadsRequest: true,
        supportsSetExpression: true,
        supportsTerminateRequest: true,
        supportsDataBreakpoints: false,
        supportsReadMemoryRequest: false,
        supportsWriteMemoryRequest: false,
        supportsDisassembleRequest: false,
        supportsCancelRequest: true,
        supportsBreakpointLocationsRequest: true,
        supportsClipboardContext: false,
        supportsSteppingGranularity: false,
        supportsInstructionBreakpoints: false,
        supportsExceptionFilterOptions: true,

        // Exception breakpoint filters
        exceptionBreakpointFilters: [
            {
                filter: 'all',
                label: 'All Exceptions',
                description: 'Break on all exceptions',
                default: false
            },
            {
                filter: 'uncaught',
                label: 'Uncaught Exceptions',
                description: 'Break on uncaught exceptions',
                default: true
            }
        ]
    };
}

function handleInitializeError(adapter: AIAssistantDebugAdapter, request: any, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success: false,
        command: request.command,
        message: `Failed to initialize debug adapter: ${errorMessage}`
    });

    throw new DebugError(`Initialize request failed: ${errorMessage}`);
}
