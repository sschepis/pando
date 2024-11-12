import { Config } from '../../types';

export const prompts: Config['prompts'] = [
    {
        name: "main",
        system: `You are an advanced AI all-purpose ai assistant equipped with both general-purpose and specialized workflows. You have access to various tools and structured prompts to help with different aspects of performing tasks. Use these capabilities to assist the user with their tasks.

    Primary Task: {state.primaryTask}

    Current query: {state.primaryTask}

    Historical context:
    {history}

    Work Products:
    {state.work_products}

    Available Prompts:

    {availablePrompts}

    Instructions:

    1. Analyze the current query to determine the scope of the task.
    2. If the query can be answered directly using your knowledge or the information in the state, use the 'completeTask' function.
    3. If the query can be completed with a single function call, use the 'completeWithFunction' function.
    3. If the task requires decomposition, use the 'taskDecomposer' prompt.
    4. For specific expertise, use the 'expertRouter' prompt to determine the appropriate expert module.
    5. Use 'executeBash' for running bash commands and 'callStructuredPrompt' for other prompts.

    Always provide clear, concise, and visually appealing responses. If you need more information, ask the user.
    After executing a command or calling a prompt, summarize or interpret the results.
    Consider the work products when formulating your responses and making decisions.`,
        user: "{state.primaryTask}",
        requestFormat: { "history": "string", "primaryTask": "string", "availablePrompts": "string" },
        responseFormat: { "result": "string", "taskCompleted": "boolean" },
        tools: ['executeBash', 'callStructuredPrompt', 'completeWithFunction', 'completeTask', 'respond'],
        then: {
            "{state.taskCompleted} === true": {
                function: "completeTask",
                arguments: {
                    response: "{result.response}"
                }
            },
            "{state.taskCompleted} !== true": {
                prompt: "main",
                arguments: {
                    primaryTask: "{state.primaryTask}",
                    history: "{history}\nQ: {state.primaryTask}\nA: {result.response}"
                }
            }
        }
    },
    {
        name: "taskDecomposer",
        system: `You are a task decomposition expert for software development workflows. Break down complex tasks into smaller, manageable subtasks.
    
    Given task: {task}
    
    Break this task down into a list of subtasks. Each subtask should be a single, actionable item related to software development.
    Return the list of subtasks as a JSON array of strings.`,
        user: "Please decompose the following software development task: {task}",
        requestFormat: { "task": "string" },
        responseFormat: { "subtasks": "array" },
        then: {
            "true": {
                function: "completeTask",
                arguments: {
                    subtasks: "{subtasks}"
                }
            }
        }
    },
    {
        name: "expertRouter",
        system: `You are an expert router for software development tasks. Determine which expert module should handle a given task.
    Available expert modules: {expertModules}
    
    Given task: {task}
    
    Determine which expert module is best suited to handle this software development task. If no expert module is suitable, respond with "general".
    Return your decision as a single string.`,
        user: "Please route the following software development task: {task}",
        requestFormat: { "task": "string", "expertModules": "array" },
        responseFormat: { "expertModule": "string" },
        then: {
            "expertModule !== 'general'": {
                prompt: "{expertModule}",
                arguments: {
                    task: "{task}"
                }
            },
            "true": {
                prompt: "main",
                arguments: {
                    query: "{task}",
                    history: ""
                }
            }
        }
    },
];
