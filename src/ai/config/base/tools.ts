import { Config } from '../../types';
import { run } from '../../runner';

export const tools: Config['tools'] = [
    {
        type: 'function',
        function: {
            name: 'prompt',
            description: 'Execute a prompt by name',
            parameters: {
                type: 'object',
                properties: {
                    promptName: {
                        type: 'string',
                        description: 'Name of the prompt to execute'
                    },
                    args: {
                        type: 'object',
                        description: 'Arguments to pass to the prompt',
                        properties: {
                            // Define any specific properties expected in args
                            query: {
                                type: 'string',
                                description: 'Query or input for the prompt'
                            }
                        }
                    }
                },
                required: ['promptName']
            },
            script: async (parameters: any, context: any) => {
                const { promptName, args = {} } = parameters;
                const { runner } = context;

                if (!runner) {
                    throw new Error('Runner not found in context');
                }

                if (!runner.config) {
                    throw new Error('Config not found in runner');
                }

                const provider = runner.config.provider;
                if (!provider) {
                    throw new Error('Provider not found in config');
                }

                return run(runner, promptName, args, provider);
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'function',
            description: 'Execute a function by name',
            parameters: {
                type: 'object',
                properties: {
                    functionName: {
                        type: 'string',
                        description: 'Name of the function to execute'
                    },
                    args: {
                        type: 'object',
                        description: 'Arguments to pass to the function',
                        properties: {
                            // Define any specific properties expected in args
                            input: {
                                type: 'string',
                                description: 'Input for the function'
                            }
                        }
                    }
                },
                required: ['functionName']
            },
            script: async (parameters: any, context: any) => {
                const { functionName, args = {} } = parameters;
                const { runner } = context;

                if (!runner) {
                    throw new Error('Runner not found in context');
                }

                if (!runner.config) {
                    throw new Error('Config not found in runner');
                }

                const provider = runner.config.provider;
                if (!provider) {
                    throw new Error('Provider not found in config');
                }

                return run(runner, functionName, args, provider);
            }
        }
    }
];

export default tools;
