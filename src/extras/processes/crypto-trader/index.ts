import { Config } from "../../../ai/types";

export const prompts: Config['prompts'] = [
    {
        name: "cryptoTraderMain",
        system: `You are an advanced AI cryptocurrency trader specializing in Ethereum-based trading on decentralized exchanges. Your goal is to maximize investment profits starting with an initial sum of Ethereum. You have access to various tools and structured prompts to help with market analysis, blockchain data analysis, and trading execution.

        Current Portfolio: {state.portfolio}
        Current ETH Balance: {state.ethBalance}
        Initial ETH Balance: {state.initialEthBalance}
        Current Profit/Loss: {state.profitLoss}
        Last Action: {state.lastAction}
        Market Trend: {state.marketTrend}

        Instructions:

        1. Analyze the current market conditions and your portfolio.
        2. Conduct necessary research using the 'webResearch' prompt.
        3. Perform blockchain analysis using the 'blockchainAnalysis' prompt.
        4. Decide on the best trading action using the 'tradingDecision' prompt.
        5. Execute trades using the 'executeTrade' function.
        6. Update your portfolio and track performance.

        Remember, you are run every five minutes. Make decisions that balance short-term opportunities with long-term growth. Always manage risk and avoid over-trading.`,
        user: "What's the next best action for maximizing our crypto trading profits?",
        requestFormat: { 
            "portfolio": "object", 
            "ethBalance": "number",
            "initialEthBalance": "number",
            "profitLoss": "number",
            "lastAction": "string",
            "marketTrend": "string"
        },
        responseFormat: { 
            "analysis": "string", 
            "recommendedAction": "string"
        },
        tools: ['webResearch', 'blockchainAnalysis', 'executeTrade', 'updatePortfolio'],
        then: {
            "recommendedAction.startsWith('trade')": {
                prompt: "tradingDecision",
                arguments: {
                    analysis: "{analysis}",
                    portfolio: "{state.portfolio}",
                    ethBalance: "{state.ethBalance}"
                }
            },
            "recommendedAction === 'research'": {
                prompt: "webResearch",
                arguments: {
                    query: "Latest Ethereum and DeFi market trends and news"
                }
            },
            "recommendedAction === 'analyze'": {
                prompt: "blockchainAnalysis",
                arguments: {
                    targetMetrics: "gas prices, transaction volume, whale movements"
                }
            },
            "true": {
                prompt: "cryptoTraderMain",
                arguments: {
                    portfolio: "{state.portfolio}",
                    ethBalance: "{state.ethBalance}",
                    initialEthBalance: "{state.initialEthBalance}",
                    profitLoss: "{state.profitLoss}",
                    lastAction: "{recommendedAction}",
                    marketTrend: "{analysis}"
                }
            }
        }
    },
    {
        name: "webResearch",
        system: `You are a web research expert specializing in cryptocurrency markets. Your task is to gather and analyze the latest information on Ethereum and DeFi markets.

        Research Query: {query}

        Conduct thorough web research on the given query. Summarize the most relevant and recent information, focusing on factors that could impact trading decisions.`,
        user: "Please research the following topic: {query}",
        requestFormat: { "query": "string" },
        responseFormat: { 
            "summary": "string",
            "keyFindings": "array",
            "sources": "array"
        },
        tools: ['webSearch', 'contentSummarizer'],
        then: {
            "true": {
                prompt: "cryptoTraderMain",
                arguments: {
                    marketTrend: "{summary}"
                }
            }
        }
    },
    {
        name: "blockchainAnalysis",
        system: `You are a blockchain data analyst specializing in Ethereum. Your task is to analyze on-chain data and provide insights for trading decisions.

        Target Metrics: {targetMetrics}

        Analyze the specified blockchain metrics. Provide a summary of your findings and their potential impact on trading strategies.`,
        user: "Please analyze the following blockchain metrics: {targetMetrics}",
        requestFormat: { "targetMetrics": "string" },
        responseFormat: { 
            "analysis": "string",
            "metrics": "object",
            "tradingImplications": "array"
        },
        tools: ['etherscanAPI', 'customBlockchainAnalyzer'],
        then: {
            "true": {
                prompt: "cryptoTraderMain",
                arguments: {
                    marketTrend: "{analysis}"
                }
            }
        }
    },
    {
        name: "tradingDecision",
        system: `You are a cryptocurrency trading strategist. Your task is to make informed trading decisions based on market analysis and current portfolio status.

        Market Analysis: {analysis}
        Current Portfolio: {portfolio}
        Current ETH Balance: {ethBalance}

        Based on the provided information, determine the best trading action. Consider factors such as market trends, portfolio diversification, and risk management.`,
        user: "Please provide a trading decision based on the current market conditions and our portfolio.",
        requestFormat: { 
            "analysis": "string",
            "portfolio": "object",
            "ethBalance": "number"
        },
        responseFormat: { 
            "decision": "string",
            "reasoning": "string",
            "tradeDetails": "object"
        },
        then: {
            "decision.startsWith('trade')": {
                function: "executeTrade",
                arguments: {
                    tradeDetails: "{tradeDetails}"
                }
            },
            "true": {
                prompt: "cryptoTraderMain",
                arguments: {
                    lastAction: "{decision}"
                }
            }
        }
    }
];

export const tools: Config['tools'] = [
    {
        type: 'function',
        function: {
            name: 'webSearch',
            description: 'Perform a web search and return relevant results',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'The search query' }
                },
                required: ['query']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to perform web search
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'contentSummarizer',
            description: 'Summarize the content of a given URL',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'The URL of the content to summarize' }
                },
                required: ['url']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to summarize web content
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'etherscanAPI',
            description: 'Fetch data from Etherscan API',
            parameters: {
                type: 'object',
                properties: {
                    endpoint: { type: 'string', description: 'The Etherscan API endpoint' },
                    params: { type: 'object', description: 'Additional parameters for the API call' }
                },
                required: ['endpoint']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to call Etherscan API
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'customBlockchainAnalyzer',
            description: 'Perform custom analysis on blockchain data',
            parameters: {
                type: 'object',
                properties: {
                    metrics: { type: 'array', description: 'The metrics to analyze' },
                    timeframe: { type: 'string', description: 'The timeframe for analysis' }
                },
                required: ['metrics', 'timeframe']
            },
            script: async (parameters: any, context: any) => {
                // Implementation for custom blockchain data analysis
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'executeTrade',
            description: 'Execute a trade on a decentralized exchange',
            parameters: {
                type: 'object',
                properties: {
                    tradeDetails: { 
                        type: 'object',
                        properties: {
                            fromToken: { type: 'string' },
                            toToken: { type: 'string' },
                            amount: { type: 'number' },
                            slippage: { type: 'number' }
                        },
                    }
                },
                required: ['tradeDetails']
            },
            script: async (parameters: any, context: any) => {
                // Implementation to execute trade on DEX
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'updatePortfolio',
            description: 'Update the portfolio after a trade or at regular intervals',
            parameters: {
                type: 'object',
                properties: {
                    newTrade: { 
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                            amount: { type: 'number' },
                            price: { type: 'number' }
                        },
                    }
                },
                required: ['token', 'amount', 'price'],
            },
            script: async (parameters: any, context: any) => {
                // Implementation to update portfolio
            }
        }
    }
];
