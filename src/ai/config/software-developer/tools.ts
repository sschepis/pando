import { Config } from '../../types';

export const tools: Config['tools'] = [
    {
        type: 'function',
        function: {
            name: 'runTests',
            description: 'Run unit tests for the project',
            parameters: {
                type: 'object',
                properties: {
                    testCommand: {
                        type: 'string',
                        description: 'The command to run the tests'
                    }
                },
                required: ['testCommand']
            },
            script: async (parameters: any, context: any) => {
                const { testCommand } = parameters;
                const { exec } = context.require('child_process');
                return new Promise((resolve, reject) => {
                    exec(testCommand, { cwd: process.cwd() }, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            resolve({ success: false, output: error.message });
                        } else {
                            resolve({ success: true, output: stdout });
                        }
                    });
                });
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'lintCode',
            description: 'Lint the code in the project',
            parameters: {
                type: 'object',
                properties: {
                    lintCommand: {
                        type: 'string',
                        description: 'The command to run the linter'
                    }
                },
                required: ['lintCommand']
            },
            script: async (parameters: any, context: any) => {
                const { lintCommand } = parameters;
                const { exec } = context.require('child_process');
                return new Promise((resolve, reject) => {
                    exec(lintCommand, { cwd: process.cwd() }, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            resolve({ success: false, output: error.message });
                        } else {
                            resolve({ success: true, output: stdout });
                        }
                    });
                });
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'updateStatus',
            description: 'Update the _STATUS_.md file with the current state of the enhancement process',
            parameters: {
                type: 'object',
                properties: {
                    taskList: { type: 'array', description: 'The current task list' },
                    status: { type: 'string', description: 'The current status of the enhancement process' },
                    completedTask: { type: 'string', description: 'The task that was just completed' },
                    output: { type: 'string', description: 'The output of the completed task' },
                    workProduct: { type: 'object', description: 'The work product of the completed task' }
                },
                required: ['taskList', 'status']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to update _STATUS_.md file
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'trackCompletion',
            description: 'Update the overall completion percentage of the enhancement process',
            parameters: {
                type: 'object',
                properties: {
                    completedTasks: { type: 'number', description: 'The number of completed tasks' },
                    totalTasks: { type: 'number', description: 'The total number of tasks' }
                },
                required: ['completedTasks', 'totalTasks']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to calculate and update completion percentage
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'modifyCode',
            description: 'Modify the codebase according to the enhancement task',
            parameters: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'The path to the file to be modified' },
                    changes: { type: 'string', description: 'The changes to be made to the file' }
                },
                required: ['filePath', 'changes']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to modify code files
            }
        }
    }
];
