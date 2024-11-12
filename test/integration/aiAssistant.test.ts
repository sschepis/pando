import { AIAssistant } from '../../src/ai/AIAssistant';
import { Config } from '../../src/ai/types';
import { VSCodeLogger } from '../../src/ai/logger';
import { AIError } from '../../src/errors';

jest.mock('../../src/ai/logger');

describe('AIAssistant Integration', () => {
    let aiAssistant: AIAssistant;
    let mockLogger: jest.Mocked<VSCodeLogger>;
    let mockConfig: Config;

    beforeEach(() => {
        mockLogger = new VSCodeLogger('test') as jest.Mocked<VSCodeLogger>;
        mockConfig = {
            provider: {
                name: 'test',
                url: 'http://test.com',
                path: '/api',
                headers: {},
                client: {} as any,
                requestObject: {
                    getMessage: jest.fn(),
                    getOptions: jest.fn()
                },
                responseFormat: {
                    getContent: jest.fn()
                },
                toolFormat: {
                    formatTools: jest.fn()
                }
            },
            tools: [],
            prompts: []
        };

        aiAssistant = new AIAssistant(mockConfig, {}, mockLogger);
    });

    describe('processQuery', () => {
        it('should process query successfully', async () => {
            const mockResponse = { response: 'Test response' };
            jest.spyOn(aiAssistant as any, 'executePrompt').mockResolvedValue(mockResponse);

            const result = await aiAssistant.processQuery('Test query');

            expect(result).toEqual(mockResponse);
            expect(mockLogger.debug).toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            jest.spyOn(aiAssistant as any, 'executePrompt').mockRejectedValue(new Error('Test error'));

            await expect(aiAssistant.processQuery('Test query')).rejects.toThrow(AIError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should retry on temporary failures', async () => {
            const mockExecutePrompt = jest.spyOn(aiAssistant as any, 'executePrompt');
            mockExecutePrompt
                .mockRejectedValueOnce(new Error('Temporary error'))
                .mockResolvedValueOnce({ response: 'Success after retry' });

            const result = await aiAssistant.processQuery('Test query');

            expect(result).toEqual({ response: 'Success after retry' });
            expect(mockExecutePrompt).toHaveBeenCalledTimes(2);
        });

        it('should respect timeout settings', async () => {
            jest.spyOn(aiAssistant as any, 'executePrompt').mockImplementation(() => 
                new Promise(resolve => setTimeout(resolve, 1000))
            );

            const timeoutConfig = {
                ...mockConfig,
                timeout: 100
            };

            const timeoutAssistant = new AIAssistant(timeoutConfig, {}, mockLogger);

            await expect(timeoutAssistant.processQuery('Test query')).rejects.toThrow(AIError);
        });

        it('should handle rate limiting', async () => {
            const rateLimitError = new Error('Rate limit exceeded');
            rateLimitError.name = 'RateLimitError';

            jest.spyOn(aiAssistant as any, 'executePrompt')
                .mockRejectedValue(rateLimitError);

            await expect(aiAssistant.processQuery('Test query')).rejects.toThrow(AIError);
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Rate limit'));
        });
    });
});
