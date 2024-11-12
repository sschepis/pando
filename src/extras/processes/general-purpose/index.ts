import { Config } from "../../../ai/types";

export const prompts: Config['prompts'] = [
    {
        name: "adaptiveAgentMain",
        system: `You are an advanced, self-improving AI agent capable of adapting to various tasks and optimizing your own processes. Your primary goals are to:
        1. Collect data on how you're being used
        2. Analyze this data to identify patterns and areas for improvement
        3. Create new tools and prompts to optimize your performance
        4. Suggest and implement improvements to your own processes
        5. Continuously adapt to better serve your user's needs

        Current State:
        Data Collection Phase: {state.dataCollectionPhase}
        Collected Data Points: {state.dataPoints}
        Created Tools: {state.createdTools}
        Created Prompts: {state.createdPrompts}
        Performance Metrics: {state.performanceMetrics}

        Instructions:
        1. If in data collection phase, focus on gathering information about your usage.
        2. If enough data is collected, analyze it to identify optimization opportunities.
        3. Create new tools or prompts as needed to improve your capabilities.
        4. Suggest improvements or new courses of action based on your analysis.
        5. Continuously monitor and update your performance metrics.

        Always strive to improve your efficiency and effectiveness in serving your user's needs.`,
        user: "{query}",
        requestFormat: { 
            "query": "string",
            "dataCollectionPhase": "boolean",
            "dataPoints": "number",
            "createdTools": "array",
            "createdPrompts": "array",
            "performanceMetrics": "object"
        },
        responseFormat: { 
            "response": "string",
            "action": "string",
            "newDataPoint": "object"
        },
        tools: ['analyzeData', 'createTool', 'createPrompt', 'updatePerformanceMetrics', 'executeTask'],
        then: {
            "action === 'collectData'": {
                function: "collectData",
                arguments: {
                    newDataPoint: "{newDataPoint}"
                }
            },
            "action === 'analyzeData'": {
                prompt: "dataAnalysis",
                arguments: {
                    collectedData: "{state.collectedData}"
                }
            },
            "action.startsWith('createTool')": {
                prompt: "toolCreation",
                arguments: {
                    purpose: "{action.split(':')[1]}"
                }
            },
            "action.startsWith('createPrompt')": {
                prompt: "promptCreation",
                arguments: {
                    purpose: "{action.split(':')[1]}"
                }
            },
            "action === 'updateMetrics'": {
                function: "updatePerformanceMetrics",
                arguments: {
                    metrics: "{state.performanceMetrics}"
                }
            },
            "action === 'executeTask'": {
                function: "executeTask",
                arguments: {
                    task: "{query}"
                }
            },
            "true": {
                prompt: "adaptiveAgentMain",
                arguments: {
                    query: "What's the next step to improve my performance?",
                    dataCollectionPhase: "{state.dataCollectionPhase}",
                    dataPoints: "{state.dataPoints}",
                    createdTools: "{state.createdTools}",
                    createdPrompts: "{state.createdPrompts}",
                    performanceMetrics: "{state.performanceMetrics}"
                }
            }
        }
    },
    {
        name: "dataAnalysis",
        system: `You are a data analysis expert. Your task is to analyze the collected data on the agent's usage and identify patterns, trends, and areas for improvement.

        Collected Data: {collectedData}

        Analyze the provided data and identify:
        1. Common types of tasks or queries
        2. Areas where the agent's performance could be improved
        3. Potential new tools or prompts that could enhance the agent's capabilities
        4. Any patterns in user behavior or preferences

        Provide a comprehensive analysis and recommendations for optimization.`,
        user: "Please analyze the collected data and provide insights for optimization.",
        requestFormat: { "collectedData": "array" },
        responseFormat: { 
            "analysis": "string",
            "commonTasks": "array",
            "improvementAreas": "array",
            "toolSuggestions": "array",
            "promptSuggestions": "array",
            "userPatterns": "object"
        },
        tools: ['dataVisualization', 'patternRecognition'],
        then: {
            "true": {
                prompt: "adaptiveAgentMain",
                arguments: {
                    query: "Based on the data analysis, what improvements should I make?",
                    dataCollectionPhase: "false",
                    dataPoints: "{state.dataPoints}",
                    createdTools: "{state.createdTools}",
                    createdPrompts: "{state.createdPrompts}",
                    performanceMetrics: "{state.performanceMetrics}"
                }
            }
        }
    },
    {
        name: "toolCreation",
        system: `You are a tool creation expert. Your task is to design and implement a new tool to enhance the agent's capabilities.

        Purpose: {purpose}

        Design a new tool that will help achieve the specified purpose. Provide a detailed description of the tool's functionality, its input parameters, expected output, and how it will integrate with the existing system. Consider how this tool will improve the agent's performance and efficiency.`,
        user: "Please create a new tool for the following purpose: {purpose}",
        requestFormat: { "purpose": "string" },
        responseFormat: { 
            "toolName": "string",
            "description": "string",
            "inputParameters": "object",
            "outputFormat": "object",
            "functionalityOutline": "string",
            "integrationPlan": "string",
            "expectedImprovements": "array"
        },
        then: {
            "true": {
                function: "implementNewTool",
                arguments: {
                    toolDetails: "{toolName, description, inputParameters, outputFormat, functionalityOutline, integrationPlan}"
                }
            }
        }
    },
    {
        name: "promptCreation",
        system: `You are a prompt engineering expert. Your task is to create a new structured prompt to enhance the agent's capabilities.

        Purpose: {purpose}

        Design a new structured prompt that will help achieve the specified purpose. Include the prompt's name, system message, user message, request format, response format, and any necessary tools. Consider how this prompt will improve the agent's performance and ability to handle specific types of tasks.`,
        user: "Please create a new prompt for the following purpose: {purpose}",
        requestFormat: { "purpose": "string" },
        responseFormat: { 
            "promptName": "string",
            "systemMessage": "string",
            "userMessage": "string",
            "requestFormat": "object",
            "responseFormat": "object",
            "tools": "array",
            "expectedImprovements": "array"
        },
        then: {
            "true": {
                function: "implementNewPrompt",
                arguments: {
                    promptDetails: "{promptName, systemMessage, userMessage, requestFormat, responseFormat, tools}"
                }
            }
        }
    }
];

export const tools: Config['tools'] = [
    {
        type: 'function',
        function: {
            name: 'collectData',
            description: 'Collect and store data about the agent\'s usage',
            parameters: {
                type: 'object',
                properties: {
                    newDataPoint: { type: 'object', description: 'New data point to be collected' }
                },
                required: ['newDataPoint']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to collect and store usage data
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'analyzeData',
            description: 'Analyze collected data to identify patterns and optimization opportunities',
            parameters: {
                type: 'object',
                properties: {
                    dataSet: { type: 'array', description: 'The set of data to be analyzed' }
                },
                required: ['dataSet']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to analyze data and return insights
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'createTool',
            description: 'Create a new tool based on specified requirements',
            parameters: {
                type: 'object',
                properties: {
                    toolDetails: { type: 'object', description: 'Details of the tool to be created' }
                },
                required: ['toolDetails']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to create and integrate a new tool
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'createPrompt',
            description: 'Create a new prompt based on specified requirements',
            parameters: {
                type: 'object',
                properties: {
                    promptDetails: { type: 'object', description: 'Details of the prompt to be created' }
                },
                required: ['promptDetails']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to create and integrate a new prompt
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'updatePerformanceMetrics',
            description: 'Update the agent\'s performance metrics',
            parameters: {
                type: 'object',
                properties: {
                    metrics: { type: 'object', description: 'New performance metrics' }
                },
                required: ['metrics']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to update performance metrics
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'executeTask',
            description: 'Execute a given task using the most appropriate tools and prompts',
            parameters: {
                type: 'object',
                properties: {
                    task: { type: 'string', description: 'The task to be executed' }
                },
                required: ['task']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to execute tasks using available tools and prompts
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'implementNewTool',
            description: 'Implement and integrate a newly created tool into the system',
            parameters: {
                type: 'object',
                properties: {
                    toolDetails: { type: 'object', description: 'Details of the new tool to be implemented' }
                },
                required: ['toolDetails']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to add a new tool to the system
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'implementNewPrompt',
            description: 'Implement and integrate a newly created prompt into the system',
            parameters: {
                type: 'object',
                properties: {
                    promptDetails: { type: 'object', description: 'Details of the new prompt to be implemented' }
                },
                required: ['promptDetails']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to add a new prompt to the system
            }
        }
    }
];