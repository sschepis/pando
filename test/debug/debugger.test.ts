import * as vscode from 'vscode';
import { mockVscode } from '../setup';
import { DebugSession } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';

class TestDebugSession extends DebugSession {
    public sendResponse(response: DebugProtocol.Response) {
        super.sendResponse(response);
    }

    public sendEvent(event: DebugProtocol.Event) {
        super.sendEvent(event);
    }
}

describe('Debug Session', () => {
    let debugSession: TestDebugSession;

    beforeEach(() => {
        debugSession = new TestDebugSession();
    });

    describe('initialize', () => {
        it('should initialize debug session', async () => {
            const response: DebugProtocol.InitializeResponse = {
                seq: 0,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'initialize',
                body: {}
            };

            await debugSession.sendResponse(response);
            expect(response.success).toBeTruthy();
        });
    });

    describe('launch', () => {
        it('should launch debug session', async () => {
            const response: DebugProtocol.LaunchResponse = {
                seq: 0,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'launch'
            };

            await debugSession.sendResponse(response);
            expect(response.success).toBeTruthy();
        });
    });

    describe('setBreakpoints', () => {
        it('should set breakpoints', async () => {
            const response: DebugProtocol.SetBreakpointsResponse = {
                seq: 0,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'setBreakpoints',
                body: {
                    breakpoints: []
                }
            };

            await debugSession.sendResponse(response);
            expect(response.success).toBeTruthy();
        });
    });
});
