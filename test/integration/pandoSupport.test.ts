import { PandoExecutionEngine } from '../../src/pandoExecutionEngine/engine';
import { AIAssistant } from '../../src/ai/AIAssistant';
import { VSCodeLogger } from '../../src/ai/logger';
import { ExecutionContext } from '../../src/pandoExecutionEngine/context';
import { ParseError, ExecutionError } from '../../src/errors';

jest.mock('../../src/pandoExecutionEngine/engine');
jest.mock('../../src/ai/AIAssistant');
jest.mock('../../src/pandoExecutionEngine/context');

describe('Pando Support Integration', () => {
    let mockPandoExecutionEngine: jest.Mocked<PandoExecutionEngine>;
    let mockAIAssistant: jest.Mocked<AIAssistant>;
    let mockLogger: jest.Mocked<VSCodeLogger>;
    let mockContext: jest.Mocked<ExecutionContext>;
    const mockPromptContent = `
        name: test
        systemPrompt: Test system prompt
        userPrompt: Test user prompt
        input:
          key: value
        output:
          result: string
    `;

    beforeEach(() => {
        mockLogger = new VSCodeLogger('test') as jest.Mocked<VSCodeLogger>;
        mockAIAssistant = new AIAssistant({} as any, {} as any, mockLogger) as jest.Mocked<AIAssistant>;
        mockContext = new ExecutionContext() as jest.Mocked<ExecutionContext>;
        mockPandoExecutionEngine = new PandoExecutionEngine({ aiAssistant: mockAIAssistant }) as jest.Mocked<PandoExecutionEngine>;
    });

    describe('Prompt Execution', () => {
        it('should execute prompt successfully', async () => {
            const mockResult = { variables: { result: 'success' } };
            jest.spyOn(mockPandoExecutionEngine, 'execute').mockResolvedValue(mockResult);

            const result = await mockPandoExecutionEngine.execute(mockPromptContent);

            expect(result).toEqual(mockResult);
            expect(mockPandoExecutionEngine.execute).toHaveBeenCalledWith(mockPromptContent);
        });

        it('should handle parse errors', async () => {
            jest.spyOn(mockPandoExecutionEngine, 'execute').mockRejectedValue(new ParseError('Invalid prompt'));

            await expect(mockPandoExecutionEngine.execute(mockPromptContent))
                .rejects.toThrow(ParseError);
        });

        it('should handle execution errors', async () => {
            jest.spyOn(mockPandoExecutionEngine, 'execute').mockRejectedValue(new ExecutionError('Execution failed'));

            await expect(mockPandoExecutionEngine.execute(mockPromptContent))
                .rejects.toThrow(ExecutionError);
        });
    });

    describe('Query Processing', () => {
        it('should process query successfully', async () => {
            const mockQuery = 'test query';
            const mockResponse = { result: 'success' };
            
            jest.spyOn(mockPandoExecutionEngine, 'processQuery').mockResolvedValue(mockResponse);

            const result = await mockPandoExecutionEngine.processQuery(mockQuery);

            expect(result).toEqual(mockResponse);
            expect(mockPandoExecutionEngine.processQuery).toHaveBeenCalledWith(mockQuery);
        });

        it('should handle processing errors', async () => {
            const mockQuery = 'test query';
            
            jest.spyOn(mockPandoExecutionEngine, 'processQuery').mockRejectedValue(new ExecutionError('Processing failed'));

            await expect(mockPandoExecutionEngine.processQuery(mockQuery))
                .rejects.toThrow(ExecutionError);
        });
    });

    describe('Context Management', () => {
        it('should maintain context between executions', async () => {
            const mockState = { variables: { key: 'value' } };
            mockContext.variables = mockState.variables;

            jest.spyOn(mockPandoExecutionEngine, 'execute').mockResolvedValue(mockState);
            jest.spyOn(mockPandoExecutionEngine, 'getContext').mockReturnValue(mockContext);

            await mockPandoExecutionEngine.execute(mockPromptContent);
            const context = mockPandoExecutionEngine.getContext();

            expect(context.variables).toEqual(mockState.variables);
        });
    });
});
