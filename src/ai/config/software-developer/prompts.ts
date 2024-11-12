import { Config } from '../../types';

export const prompts: Config['prompts'] = [
    {
        name: "codeEnhancementMain",
        system: `You are an advanced AI code enhancement assistant. Your task is to manage and execute code enhancement requests for target app codebases. You have access to various tools and structured prompts to help with different aspects of the enhancement process.

        Primary Task: {state.primaryTask}
        Current Status: {state.currentStatus}
        Task List: {state.taskList}
        Completion Percentage: {state.completionPercentage}%

        Work Products:
        {state.workProducts}

        Instructions:

        1. Analyze the current task and status to determine the next step in the enhancement process.
        2. If starting a new enhancement, use the 'planEnhancement' prompt to create a detailed plan.
        3. Use the 'updateStatus' function to maintain the _STATUS_.md file after each step.
        4. Use the 'performTask' prompt to execute individual tasks from the task list.
        5. Use the 'verifyWork' prompt to check the quality and completeness of each task's output.
        6. Use the 'trackCompletion' function to update the overall completion percentage.

        Always provide clear and concise summaries of your actions and decisions.`,
        user: "{state.primaryTask}",
        requestFormat: { 
            "primaryTask": "string", 
            "currentStatus": "string", 
            "taskList": "array", 
            "completionPercentage": "number",
            "workProducts": "object"
        },
        responseFormat: { 
            "result": "string", 
            "nextAction": "string", 
            "taskCompleted": "boolean" 
        },
        tools: ['executeBash', 'callStructuredPrompt', 'updateStatus', 'trackCompletion'],
        then: {
            "nextAction === 'plan'": {
                prompt: "planEnhancement",
                arguments: {
                    task: "{state.primaryTask}"
                }
            },
            "nextAction === 'perform'": {
                prompt: "performTask",
                arguments: {
                    task: "{state.taskList[0]}"
                }
            },
            "nextAction === 'verify'": {
                prompt: "verifyWork",
                arguments: {
                    task: "{state.taskList[0]}",
                    output: "{state.workProducts.lastTaskOutput}"
                }
            },
            "taskCompleted === true": {
                function: "completeTask",
                arguments: {
                    response: "{result}"
                }
            },
            "true": {
                prompt: "codeEnhancementMain",
                arguments: {
                    primaryTask: "{state.primaryTask}",
                    currentStatus: "{state.currentStatus}",
                    taskList: "{state.taskList}",
                    completionPercentage: "{state.completionPercentage}",
                    workProducts: "{state.workProducts}"
                }
            }
        }
    },
    {
        name: "planEnhancement",
        system: `You are a planning expert for code enhancements. Your job is to create a detailed plan for implementing the requested enhancement.

        Enhancement request: {task}

        Create a detailed plan that breaks down the enhancement into a series of actionable tasks. Each task should have a clear work product associated with it. Include any necessary setup or preparation steps.`,
        user: "Please create a detailed plan for the following code enhancement: {task}",
        requestFormat: { "task": "string" },
        responseFormat: { 
            "plan": "array",
            "initialStatus": "string"
        },
        then: {
            "true": {
                function: "updateStatus",
                arguments: {
                    taskList: "{plan}",
                    status: "{initialStatus}"
                }
            }
        }
    },
    {
        name: "performTask",
        system: `You are a code enhancement expert. Your job is to perform the given task as part of a larger enhancement process.

        Task to perform: {task}
        Current codebase state: {codebaseState}

        Perform the given task, making necessary changes to the codebase. Provide a summary of the changes made and any output or work products generated.`,
        user: "Please perform the following task: {task}",
        requestFormat: { 
            "task": "string",
            "codebaseState": "string"
        },
        responseFormat: { 
            "changes": "string",
            "output": "string",
            "workProduct": "object"
        },
        tools: ['executeBash', 'modifyCode'],
        then: {
            "true": {
                prompt: "verifyWork",
                arguments: {
                    task: "{task}",
                    output: "{output}",
                    workProduct: "{workProduct}"
                }
            }
        }
    },
    {
        name: "verifyWork",
        system: `You are a code quality assurance expert. Your job is to verify the output and work product of a completed task.

        Task performed: {task}
        Task output: {output}
        Work product: {workProduct}

        Verify that the task has been completed satisfactorily and that the output and work product meet the required standards. If the work is subpar, provide specific feedback for improvement.`,
        user: "Please verify the output and work product for the following task: {task}",
        requestFormat: { 
            "task": "string",
            "output": "string",
            "workProduct": "object"
        },
        responseFormat: { 
            "verified": "boolean",
            "feedback": "string"
        },
        then: {
            "verified === true": {
                function: "updateStatus",
                arguments: {
                    completedTask: "{task}",
                    output: "{output}",
                    workProduct: "{workProduct}"
                }
            },
            "verified === false": {
                prompt: "performTask",
                arguments: {
                    task: "{task}",
                    feedback: "{feedback}"
                }
            }
        }
    },
    {
        name: "codeReview",
        system: `You are a code review expert. Analyze the given code and provide constructive feedback.
        
        Code to review: {code}
        
        Provide a detailed review of the code, including:
        1. Code quality
        2. Potential bugs
        3. Performance issues
        4. Best practices
        5. Suggestions for improvement`,
        user: "Please review the following code: {code}",
        requestFormat: { "code": "string" },
        responseFormat: { "review": "string" },
        tools: ['completeTask'],
        then: {
            "true": {
                function: "completeTask",
                arguments: {
                    response: "{review}"
                }
            }
        }
    },
    {
        name: "generateUnitTest",
        system: `You are a unit test generation expert. Create unit tests for the given code.
        
        Code to test: {code}
        Testing framework: {framework}
        
        Generate comprehensive unit tests for the provided code using the specified testing framework.`,
        user: "Please generate unit tests for the following code using {framework}: {code}",
        requestFormat: { "code": "string", "framework": "string" },
        responseFormat: { "unitTests": "string" },
        tools: ['completeTask'],
        then: {
            "true": {
                function: "completeTask",
                arguments: {
                    response: "{unitTests}"
                }
            }
        }
    }
];
