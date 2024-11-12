import axios from 'axios';
import { Config, RunnerOptions, Provider } from '../types';
import { AIError } from '../../errors';
import { setupHttpInterceptors } from './setupHttpInterceptors';
import { EnhancedEventEmitter } from '../utils';
import { VSCodeLogger } from '../logger';

export function createAIAssistantRunner(config: Config, options: RunnerOptions = {}, logger: VSCodeLogger) {
    const runner: any = new EnhancedEventEmitter();
    runner.config = config;
    runner.options = {
        maxDepth: 10,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        ...options
    };
    runner.logger = logger;
    runner.state = options.state || {};
    runner.depth = 0;

    // Set up HTTP client
    runner.httpClient = axios.create({
        timeout: runner.options.timeout
    });

    // Set up interceptors
    setupHttpInterceptors(runner);

    // Error handling
    runner.on('error', (error: unknown) => {
        if (error instanceof AIError) {
            runner.logger.error('AIError occurred', {
                message: error instanceof Error ? error.message : String(error),
                details: error instanceof Error && 'details' in error ? error.details : undefined,
                stack: error instanceof Error ? error.stack : undefined
            });
        } else {
            runner.logger.error('Unexpected error', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    });

    // Success handling
    runner.on('success', (result: any) => {
        runner.logger.debug('Operation completed successfully', { result });
    });

    return runner;
}
