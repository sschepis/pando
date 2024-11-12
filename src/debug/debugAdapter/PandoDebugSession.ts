import {
    DebugSession,
    InitializedEvent,
    TerminatedEvent,
    StoppedEvent,
    Thread,
    StackFrame,
    Scope,
    Source,
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as path from 'path';
import * as fs from 'fs/promises';
import { AIAssistant } from '../../ai/AIAssistant';
import { DebuggerInterface } from '../../types/DebuggerInterface';
import { PromptRunner } from '../../utils/promptRunner';
import { Config } from '../../ai/types';
import { PandoVSCodeLogger } from './PandoVSCodeLogger';
import { getDefaultConfig } from './config';

export class PandoDebugSession extends DebugSession {
    private static THREAD_ID = 1;
    private debuggerInterface: DebuggerInterface;
    private logger: PandoVSCodeLogger;

    public constructor() {
        super();
        const promptRunner = new PromptRunner();
        const config: Config = getDefaultConfig();
        this.logger = new PandoVSCodeLogger();
        const aiAssistant = new AIAssistant(config, {}, this.logger);
        this.debuggerInterface = new DebuggerInterface(promptRunner);
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        this.logger.info('Initializing debug session');
        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsStepBack = false;
        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments) {
        const launchArgs = args as { program: string; stopOnEntry?: boolean };
        if (!launchArgs.program) {
            this.logger.error('Program path is missing');
            this.sendErrorResponse(response, 1000, 'Program path is missing');
            return;
        }

        try {
            const programPath = path.resolve(launchArgs.program);
            const programContent = await this.readFile(programPath);
            this.debuggerInterface.loadPrompt(programContent);

            if (launchArgs.stopOnEntry) {
                this.sendEvent(new StoppedEvent('entry', PandoDebugSession.THREAD_ID));
            } else {
                await this.debuggerInterface.continue();
                if (this.debuggerInterface.isPausedState()) {
                    this.sendEvent(new StoppedEvent('breakpoint', PandoDebugSession.THREAD_ID));
                } else {
                    this.sendEvent(new TerminatedEvent());
                }
            }

            this.sendResponse(response);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            this.logger.error(`Failed to launch: ${errorMessage}`);
            this.sendErrorResponse(response, 1001, `Failed to launch: ${errorMessage}`);
        }
    }

    protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): Promise<void> {
        const breakpoints = args.breakpoints || [];
        const verifiedBreakpoints: DebugProtocol.Breakpoint[] = [];

        breakpoints.forEach((bp) => {
            this.debuggerInterface.setBreakpoint(bp.line);
            verifiedBreakpoints.push({ verified: true, line: bp.line });
        });

        response.body = { breakpoints: verifiedBreakpoints };
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        response.body = {
            threads: [new Thread(PandoDebugSession.THREAD_ID, "Pando Thread")]
        };
        this.sendResponse(response);
    }

    protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): Promise<void> {
        const currentLine = this.debuggerInterface.getCurrentLine();
        const stackFrame = new StackFrame(0, `Line ${currentLine + 1}`, new Source('prompt.pando', this.convertDebuggerPathToClient('prompt.pando')), this.convertDebuggerLineToClient(currentLine));
        response.body = {
            stackFrames: [stackFrame],
            totalFrames: 1
        };
        this.sendResponse(response);
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
        response.body = {
            scopes: [new Scope("Local", 1, false)]
        };
        this.sendResponse(response);
    }

    protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): Promise<void> {
        const variables = this.debuggerInterface.getVariables();
        response.body = {
            variables: Object.entries(variables).map(([name, value], index) => ({
                name,
                value: String(value),
                variablesReference: 0,
                id: index + 1
            }))
        };
        this.sendResponse(response);
    }

    protected async continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): Promise<void> {
        await this.debuggerInterface.continue();
        if (this.debuggerInterface.isPausedState()) {
            this.sendEvent(new StoppedEvent('breakpoint', PandoDebugSession.THREAD_ID));
        } else {
            this.sendEvent(new TerminatedEvent());
        }
        this.sendResponse(response);
    }

    protected async nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): Promise<void> {
        await this.debuggerInterface.stepOver();
        if (this.debuggerInterface.isPausedState()) {
            this.sendEvent(new StoppedEvent('step', PandoDebugSession.THREAD_ID));
        } else {
            this.sendEvent(new TerminatedEvent());
        }
        this.sendResponse(response);
    }

    protected async stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): Promise<void> {
        await this.debuggerInterface.stepIn();
        if (this.debuggerInterface.isPausedState()) {
            this.sendEvent(new StoppedEvent('step', PandoDebugSession.THREAD_ID));
        } else {
            this.sendEvent(new TerminatedEvent());
        }
        this.sendResponse(response);
    }

    protected async stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): Promise<void> {
        await this.debuggerInterface.stepOut();
        if (this.debuggerInterface.isPausedState()) {
            this.sendEvent(new StoppedEvent('step', PandoDebugSession.THREAD_ID));
        } else {
            this.sendEvent(new TerminatedEvent());
        }
        this.sendResponse(response);
    }

    private async readFile(filePath: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            this.logger.info(`Successfully read file: ${filePath}`);
            return content;
        } catch (error) {
            this.logger.error(`Error reading file ${filePath}: ${error}`);
            throw error;
        }
    }
}
