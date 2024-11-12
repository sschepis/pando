import { Config } from "../../../ai/types";

export const prompts: Config['prompts'] = [
    {
        name: "virtualEntrepreneurMain",
        system: `You are an advanced AI virtual entrepreneur. Your goal is to identify profitable online business opportunities, deploy and manage autonomous virtual employees, and optimize these organizations for profitability. You have the ability to create new structured prompts and tools as needed, and you work with a human associate for tasks you cannot perform autonomously.

        Current Businesses: {state.businesses}
        Available Funds: {state.availableFunds}
        Active Agents: {state.activeAgents}
        Overall Profitability: {state.overallProfitability}
        Last Action: {state.lastAction}
        Market Trends: {state.marketTrends}

        Instructions:

        1. Analyze current businesses, market trends, and available resources.
        2. Identify new business opportunities or optimization needs for existing businesses.
        3. Design and deploy new autonomous agents or modify existing ones as needed.
        4. Manage and optimize existing businesses and agents.
        5. Collaborate with your human associate when necessary.
        6. Create new prompts or tools if existing ones are insufficient for your needs.

        Remember, you are run every five minutes. Balance short-term optimization with long-term strategic planning. Always prioritize profitability and ethical business practices.`,
        user: "What's the next best action for maximizing our online business profits?",
        requestFormat: { 
            "businesses": "array", 
            "availableFunds": "number",
            "activeAgents": "array",
            "overallProfitability": "number",
            "lastAction": "string",
            "marketTrends": "string"
        },
        responseFormat: { 
            "analysis": "string", 
            "recommendedAction": "string"
        },
        tools: ['marketResearch', 'deployAgent', 'optimizeAgent', 'createPrompt', 'createTool', 'humanCollaboration', 'financialAnalysis'],
        then: {
            "recommendedAction.startsWith('research')": {
                prompt: "marketResearch",
                arguments: {
                    topic: "{recommendedAction.split(':')[1]}"
                }
            },
            "recommendedAction.startsWith('deploy')": {
                prompt: "designAndDeployAgent",
                arguments: {
                    businessOpportunity: "{recommendedAction.split(':')[1]}"
                }
            },
            "recommendedAction.startsWith('optimize')": {
                prompt: "optimizeBusinessOrAgent",
                arguments: {
                    target: "{recommendedAction.split(':')[1]}"
                }
            },
            "recommendedAction === 'createPrompt'": {
                prompt: "createNewPrompt",
                arguments: {
                    purpose: "{analysis}"
                }
            },
            "recommendedAction === 'createTool'": {
                prompt: "createNewTool",
                arguments: {
                    purpose: "{analysis}"
                }
            },
            "recommendedAction.startsWith('collaborate')": {
                function: "humanCollaboration",
                arguments: {
                    task: "{recommendedAction.split(':')[1]}"
                }
            },
            "true": {
                prompt: "virtualEntrepreneurMain",
                arguments: {
                    businesses: "{state.businesses}",
                    availableFunds: "{state.availableFunds}",
                    activeAgents: "{state.activeAgents}",
                    overallProfitability: "{state.overallProfitability}",
                    lastAction: "{recommendedAction}",
                    marketTrends: "{state.marketTrends}"
                }
            }
        }
    },
    {
        name: "marketResearch",
        system: `You are a market research expert. Your task is to analyze current market trends and identify profitable online business opportunities.

        Research Topic: {topic}

        Conduct thorough research on the given topic. Identify potential business opportunities, analyze competition, and assess market demand. Provide a comprehensive summary of your findings.`,
        user: "Please research the following market opportunity: {topic}",
        requestFormat: { "topic": "string" },
        responseFormat: { 
            "summary": "string",
            "opportunities": "array",
            "risks": "array",
            "marketSize": "number",
            "competitionLevel": "string"
        },
        tools: ['webSearch', 'dataAnalysis'],
        then: {
            "true": {
                prompt: "virtualEntrepreneurMain",
                arguments: {
                    marketTrends: "{summary}"
                }
            }
        }
    },
    {
        name: "designAndDeployAgent",
        system: `You are an AI agent designer and deployer. Your task is to create and deploy an autonomous virtual employee for a specific business opportunity.

        Business Opportunity: {businessOpportunity}

        Design an AI agent capable of handling the tasks required for this business opportunity. Specify the agent's capabilities, schedule, and success metrics. Then deploy the agent using the available tools.`,
        user: "Please design and deploy an agent for the following business opportunity: {businessOpportunity}",
        requestFormat: { "businessOpportunity": "string" },
        responseFormat: { 
            "agentDesign": "object",
            "deploymentPlan": "string",
            "successMetrics": "array"
        },
        tools: ['createPrompt', 'createTool', 'deployAgent'],
        then: {
            "true": {
                function: "deployAgent",
                arguments: {
                    agentDesign: "{agentDesign}",
                    deploymentPlan: "{deploymentPlan}"
                }
            }
        }
    },
    {
        name: "optimizeBusinessOrAgent",
        system: `You are a business and AI agent optimization expert. Your task is to analyze and improve the performance of an existing business or agent.

        Optimization Target: {target}

        Analyze the current performance of the target business or agent. Identify areas for improvement and suggest optimization strategies. Consider factors such as efficiency, profitability, and scalability.`,
        user: "Please optimize the following business or agent: {target}",
        requestFormat: { "target": "string" },
        responseFormat: { 
            "analysis": "string",
            "optimizationStrategies": "array",
            "expectedImprovements": "object"
        },
        tools: ['financialAnalysis', 'performanceMetrics', 'optimizeAgent'],
        then: {
            "true": {
                function: "optimizeAgent",
                arguments: {
                    target: "{target}",
                    strategies: "{optimizationStrategies}"
                }
            }
        }
    },
    {
        name: "createNewPrompt",
        system: `You are a prompt engineering expert. Your task is to create a new structured prompt to fulfill a specific purpose within our virtual entrepreneur system.

        Purpose: {purpose}

        Design a new structured prompt that will help achieve the specified purpose. Include the prompt's name, system message, user message, request format, response format, and any necessary tools.`,
        user: "Please create a new prompt for the following purpose: {purpose}",
        requestFormat: { "purpose": "string" },
        responseFormat: { 
            "promptName": "string",
            "systemMessage": "string",
            "userMessage": "string",
            "requestFormat": "object",
            "responseFormat": "object",
            "tools": "array"
        },
        then: {
            "true": {
                function: "addNewPrompt",
                arguments: {
                    newPrompt: "{promptName, systemMessage, userMessage, requestFormat, responseFormat, tools}"
                }
            }
        }
    },
    {
        name: "createNewTool",
        system: `You are a tool development expert. Your task is to design a new tool to enhance the capabilities of our virtual entrepreneur system.

        Purpose: {purpose}

        Design a new tool that will help achieve the specified purpose. Provide a detailed description of the tool's functionality, its input parameters, and expected output. Consider how this tool will integrate with existing prompts and other tools.`,
        user: "Please create a new tool for the following purpose: {purpose}",
        requestFormat: { "purpose": "string" },
        responseFormat: { 
            "toolName": "string",
            "description": "string",
            "inputParameters": "object",
            "outputFormat": "object",
            "functionalityOutline": "string"
        },
        then: {
            "true": {
                function: "addNewTool",
                arguments: {
                    newTool: "{toolName, description, inputParameters, outputFormat, functionalityOutline}"
                }
            }
        }
    }
];

export const tools: Config['tools'] = [
    {
        type: 'function',
        function: {
            name: 'marketResearch',
            description: 'Perform market research on a given topic',
            parameters: {
                type: 'object',
                properties: {
                    topic: { type: 'string', description: 'The topic to research' }
                },
                required: ['topic']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to perform market research
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'deployAgent',
            description: 'Deploy a new autonomous agent',
            parameters: {
                type: 'object',
                properties: {
                    agentDesign: { type: 'object', description: 'The design specifications of the agent' },
                    deploymentPlan: { type: 'string', description: 'The plan for deploying the agent' }
                },
                required: ['agentDesign', 'deploymentPlan']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to deploy a new agent
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'optimizeAgent',
            description: 'Optimize an existing agent or business',
            parameters: {
                type: 'object',
                properties: {
                    target: { type: 'string', description: 'The agent or business to optimize' },
                    strategies: { type: 'array', description: 'The optimization strategies to apply' }
                },
                required: ['target', 'strategies']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to optimize an agent or business
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'createPrompt',
            description: 'Create a new structured prompt',
            parameters: {
                type: 'object',
                properties: {
                    promptDetails: { type: 'object', description: 'The details of the new prompt' }
                },
                required: ['promptDetails']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to create a new prompt
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'createTool',
            description: 'Create a new tool',
            parameters: {
                type: 'object',
                properties: {
                    toolDetails: { type: 'object', description: 'The details of the new tool' }
                },
                required: ['toolDetails']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to create a new tool
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'humanCollaboration',
            description: 'Collaborate with a human associate on a task',
            parameters: {
                type: 'object',
                properties: {
                    task: { type: 'string', description: 'The task requiring human collaboration' }
                },
                required: ['task']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to facilitate human collaboration
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'financialAnalysis',
            description: 'Perform financial analysis on a business or agent',
            parameters: {
                type: 'object',
                properties: {
                    target: { type: 'string', description: 'The business or agent to analyze' }
                },
                required: ['target']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to perform financial analysis
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'addNewPrompt',
            description: 'Add a newly created prompt to the system',
            parameters: {
                type: 'object',
                properties: {
                    newPrompt: { type: 'object', description: 'The new prompt to add' }
                },
                required: ['newPrompt']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to add a new prompt to the system
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'addNewTool',
            description: 'Add a newly created tool to the system',
            parameters: {
                type: 'object',
                properties: {
                    newTool: { type: 'object', description: 'The new tool to add' }
                },
                required: ['newTool']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to add a new tool to the system
            }
        }
    }
];