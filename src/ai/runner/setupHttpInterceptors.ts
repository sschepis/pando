import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AIError } from '../../errors';

export function setupHttpInterceptors(runner: any) {
    runner.httpClient.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            runner.logger.debug('Making HTTP request', {
                method: config.method,
                url: config.url,
                headers: config.headers
            });
            return config;
        },
        (error: unknown) => {
            runner.logger.error('Error setting up request', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            return Promise.reject(error);
        }
    );

    runner.httpClient.interceptors.response.use(
        (response: AxiosResponse) => {
            runner.logger.debug('Received HTTP response', {
                status: response.status,
                headers: response.headers
            });
            return response;
        },
        (error: unknown) => {
            if (error instanceof AxiosError) {
                if (error.response) {
                    runner.logger.error('HTTP Error', {
                        status: error.response.status,
                        data: error.response.data,
                        headers: error.response.headers
                    });
                    throw new AIError(`HTTP Error: ${error.response.status}`, error.response.data);
                } else if (error.request) {
                    runner.logger.error('No response received', { request: error.request });
                    throw new AIError('No response received', error.request);
                } else {
                    runner.logger.error('Error setting up request', { message: error.message });
                    throw new AIError('Error setting up request', error.message);
                }
            }
            
            runner.logger.error('Unknown error', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new AIError(
                `Unknown error: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    );
}
