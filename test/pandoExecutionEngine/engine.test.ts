import { PandoExecutionEngine } from '../../src/pandoExecutionEngine/engine';
import { Evaluator } from '../../src/pandoExecutionEngine/evaluator';
import { AIAssistant } from '../../src/ai/AIAssistant';
import { ExecutionContext } from '../../src/pandoExecutionEngine/context';
import { ParseError, ExecutionError } from '../../src/errors';

jest.mock('../../src/pandoExecutionEngine/evaluator');
jest.mock('../../src/ai/AIAssistant');
jest.mock('../../src/pandoExecutionEngine/context');

describe('PandoExecutionEngine', () => {
    let engine: PandoExecutionEngine;
    let mockAIAssistant: jest.Mocked<AIAssistant>;
    let mockEvaluator: jest.Mocked<Evaluator>;
    let mockContext: jest.Mocked<ExecutionContext>;

    beforeEach(() => {
        mockAIAssistant = new AIAssistant({} as any, {} as any, console as any) as jest.Mocked<AIAssistant>;
        mockEvaluator = new Evaluator({} as any) as jest.Mocked<Evaluator>;
        mockContext = new ExecutionContext() as jest.Mocked<ExecutionContext>;

        engine = new PandoExecutionEngine({ aiAssistant: mockAIAssistant });
        (engine as any).evaluator = mockEvaluator;
        (engine as any).context = mockContext;
    });

    describe('execute', () => {
        const validPromptContent = `
            name: test
            systemPrompt: System prompt for testing
            userPrompt: User prompt for testing
            input:
              key: value
            output:
              result: string
            conditions:
              test: true
            actions:
              test: console.log("test")
            statements:
              - type: Condition
                condition: true
                body: []
                elseBody: null
        `;

        it('should execute a prompt successfully', async () => {
            mockEvaluator.evaluateStatement.mockResolvedValue(true);

            const result = await engine.execute(validPromptContent);

            expect(mockEvaluator.evaluateStatement).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should throw ParseError for invalid prompt', async () => {
            const invalidPromptContent = `
                invalid: yaml
                content: here
            `;

            await expect(engine.execute(invalidPromptContent)).rejects.toThrow(ParseError);
        });

        it('should throw ExecutionError for evaluation failure', async () => {
            mockEvaluator.evaluateStatement.mockRejectedValue(new Error('Evaluation failed'));

            await expect(engine.execute(validPromptContent)).rejects.toThrow(ExecutionError);
        });
    });

    describe('processQuery', () => {
        it('should process query successfully', async () => {
            const mockResponse = { result: 'test result' };
            mockAIAssistant.processQuery.mockResolvedValue(mockResponse);

            const result = await engine.processQuery('test query');

            expect(mockAIAssistant.processQuery).toHaveBeenCalledWith(expect.stringContaining('test query'));
            expect(result).toBe(mockResponse);
        });

        it('should throw ExecutionError for processing failure', async () => {
            mockAIAssistant.processQuery.mockRejectedValue(new Error('Processing failed'));

            await expect(engine.processQuery('test query')).rejects.toThrow(ExecutionError);
        });
    });
});
