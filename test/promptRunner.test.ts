import { executePromptWithTimeout } from '../src/ai/runner/executePromptWithTimeout';
import { AIAssistant } from '../src/ai/AIAssistant';
import { Config, Prompt } from '../src/ai/types';

// Mock the AIAssistant and other dependencies
jest.mock('../AIAssistant');
jest.mock('../ai/runner/makeRequest');

describe('Prompt Runner', () => {
    let mockAIAssistant: jest.Mocked<AIAssistant>;
    let mockConfig: Config;

    beforeEach(() => {
        mockAIAssistant = new AIAssistant({} as any, {} as any, {} as any) as jest.Mocked<AIAssistant>;
        mockConfig = {
            provider: {} as any,
            tools: [],
            prompts: []
        };
    });

    it('should execute a prompt successfully', async () => {
        const mockPrompt: Prompt = {
            name: 'testPrompt',
            system: 'You are a test system',
            user: 'This is a test prompt',
            requestFormat: {},
            responseFormat: { response: 'string' },
            tools: [],
            then: {}
        };

        mockAIAssistant.processQuery.mockResolvedValue({ response: 'Test response', taskCompleted: true });

        const result = await executePromptWithTimeout(mockAIAssistant, mockPrompt, {}, mockConfig.provider);

        expect(mockAIAssistant.processQuery).toHaveBeenCalledWith(expect.stringContaining('This is a test prompt'));
        expect(result).toEqual({ response: 'Test response', taskCompleted: true });
    });

    it('should handle errors during prompt execution', async () => {
        const mockPrompt: Prompt = {
            name: 'errorPrompt',
            system: 'You are a test system',
            user: 'This prompt will cause an error',
            requestFormat: {},
            responseFormat: { response: 'string' },
            tools: [],
            then: {}
        };

        mockAIAssistant.processQuery.mockRejectedValue(new Error('Test error'));

        await expect(executePromptWithTimeout(mockAIAssistant, mockPrompt, {}, mockConfig.provider))
            .rejects.toThrow('Test error');
    });

    it('should timeout if prompt execution takes too long', async () => {
        const mockPrompt: Prompt = {
            name: 'timeoutPrompt',
            system: 'You are a test system',
            user: 'This prompt will timeout',
            requestFormat: {},
            responseFormat: { response: 'string' },
            tools: [],
            then: {}
        };

        // Mock a delay longer than the default timeout
        jest.useFakeTimers();
        mockAIAssistant.processQuery.mockImplementation(() => 
            new Promise<{ response: string; taskCompleted: boolean }>((resolve) => {
                setTimeout(() => resolve({ response: 'Delayed response', taskCompleted: true }), 70000);
            })
        );

        const promptExecution = executePromptWithTimeout(mockAIAssistant, mockPrompt, {}, mockConfig.provider);
        
        jest.advanceTimersByTime(70000);

        await expect(promptExecution).rejects.toThrow('Prompt execution timed out');

        jest.useRealTimers();
    });
});
