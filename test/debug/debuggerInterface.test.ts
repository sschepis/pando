import { DebuggerInterface } from '../../src/types/DebuggerInterface';
import { PromptRunner } from '../../src/utils/promptRunner';

describe('DebuggerInterface', () => {
    let debuggerInterface: DebuggerInterface;
    let mockPromptRunner: jest.Mocked<PromptRunner>;

    beforeEach(() => {
        mockPromptRunner = {
            runPrompt: jest.fn()
        } as any;
        debuggerInterface = new DebuggerInterface(mockPromptRunner);
    });

    describe('loadPrompt', () => {
        it('should load prompt content correctly', () => {
            const content = 'test prompt content';
            debuggerInterface.loadPrompt(content);
            expect(debuggerInterface.getCurrentLine()).toBe(0);
            expect(debuggerInterface.isPausedState()).toBe(false);
        });
    });

    describe('breakpoints', () => {
        it('should set and remove breakpoints', () => {
            debuggerInterface.setBreakpoint(1);
            expect(debuggerInterface.isAtBreakpoint()).toBe(false);
            debuggerInterface.removeBreakpoint(1);
        });
    });

    describe('execution control', () => {
        beforeEach(() => {
            debuggerInterface.loadPrompt('line1\nline2\nline3');
        });

        it('should step over lines', () => {
            debuggerInterface.stepOver();
            expect(debuggerInterface.getCurrentLine()).toBe(1);
        });

        it('should pause execution', () => {
            debuggerInterface.pause();
            expect(debuggerInterface.isPausedState()).toBe(true);
        });
    });

    describe('variable handling', () => {
        it('should handle variables correctly', () => {
            debuggerInterface.loadPrompt('$var=test');
            debuggerInterface.stepOver();
            const variables = debuggerInterface.getVariables();
            expect(Object.keys(variables).length).toBeGreaterThan(0);
        });
    });
});
