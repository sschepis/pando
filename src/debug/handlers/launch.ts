import { AIAssistantDebugAdapter } from '../adapter';
import * as fs from 'fs';
import * as path from 'path';
import { DebugError } from '../../errors';

interface LaunchArguments {
    program: string;
    stopOnEntry?: boolean;
    noDebug?: boolean;
    args?: string[];
    cwd?: string;
    env?: { [key: string]: string };
    runtimeExecutable?: string;
    runtimeArgs?: string[];
}

export function launchRequest(adapter: AIAssistantDebugAdapter, request: any) {
    const debuggerInterface = adapter.getDebuggerInterface();
    const args = request.arguments as LaunchArguments;

    try {
        // Validate launch arguments
        validateLaunchArguments(args);

        // Resolve program path
        const programPath = resolveProgramPath(args);

        // Load and validate program file
        const fileContents = loadProgramFile(programPath);

        // Initialize program state
        initializeProgram(debuggerInterface, fileContents, args);

        // Send success response
        adapter.sendResponse({
            type: 'response',
            request_seq: request.seq,
            success: true,
            command: request.command
        });

        // Handle stopOnEntry option
        if (args.stopOnEntry) {
            adapter.sendEvent('stopped', { 
                reason: 'entry',
                threadId: 1,
                description: 'Paused on entry'
            });
        } else {
            // Start program execution
            debuggerInterface.continue();
        }
    } catch (error: unknown) {
        handleLaunchError(adapter, request, error);
    }
}

function validateLaunchArguments(args: LaunchArguments): void {
    if (!args.program) {
        throw new DebugError('Program path must be specified');
    }

    if (args.env && typeof args.env !== 'object') {
        throw new DebugError('Environment variables must be an object');
    }

    if (args.args && !Array.isArray(args.args)) {
        throw new DebugError('Program arguments must be an array');
    }

    if (args.runtimeArgs && !Array.isArray(args.runtimeArgs)) {
        throw new DebugError('Runtime arguments must be an array');
    }
}

function resolveProgramPath(args: LaunchArguments): string {
    try {
        const programPath = path.resolve(args.cwd || process.cwd(), args.program);
        
        // Check if file exists
        if (!fs.existsSync(programPath)) {
            throw new DebugError(`Program file not found: ${programPath}`);
        }

        // Check if file is readable
        try {
            fs.accessSync(programPath, fs.constants.R_OK);
        } catch {
            throw new DebugError(`Program file is not readable: ${programPath}`);
        }

        return programPath;
    } catch (error) {
        if (error instanceof DebugError) {
            throw error;
        }
        throw new DebugError(`Failed to resolve program path: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function loadProgramFile(programPath: string): string {
    try {
        const fileContents = fs.readFileSync(programPath, 'utf-8');

        // Basic validation of file contents
        if (!fileContents.trim()) {
            throw new DebugError('Program file is empty');
        }

        return fileContents;
    } catch (error) {
        if (error instanceof DebugError) {
            throw error;
        }
        throw new DebugError(`Failed to load program file: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function initializeProgram(debuggerInterface: any, fileContents: string, args: LaunchArguments): void {
    try {
        // Set up environment variables
        if (args.env) {
            Object.entries(args.env).forEach(([key, value]) => {
                process.env[key] = value;
            });
        }

        // Initialize program state
        debuggerInterface.loadPrompt(fileContents);

        // Set up program arguments
        if (args.args) {
            debuggerInterface.setVariable('args', args.args);
        }

        // Set up runtime configuration
        if (args.runtimeExecutable || args.runtimeArgs) {
            debuggerInterface.setVariable('runtime', {
                executable: args.runtimeExecutable,
                args: args.runtimeArgs
            });
        }

        // Set working directory
        if (args.cwd) {
            debuggerInterface.setVariable('cwd', args.cwd);
        }

        // Set debug mode
        debuggerInterface.setVariable('noDebug', !!args.noDebug);
    } catch (error) {
        throw new DebugError(`Failed to initialize program: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function handleLaunchError(adapter: AIAssistantDebugAdapter, request: any, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorDetails = error instanceof DebugError ? error.details : undefined;

    adapter.sendResponse({
        type: 'response',
        request_seq: request.seq,
        success: false,
        command: request.command,
        message: `Failed to launch: ${errorMessage}`,
        body: errorDetails ? { error: errorDetails } : undefined
    });

    // Send error telemetry if available
    if (adapter.sendEvent) {
        adapter.sendEvent('error', {
            error: errorMessage,
            details: errorDetails
        });
    }
}
