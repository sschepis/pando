import { Process, ProcessState, ProcessStep } from '../../../ai/config/Process';
import { Config } from "../../../ai/types";

const steps: ProcessStep[] = [
    {
        type: 'prompt',
        name: 'analyzeCryptoMarket',
        execute: async (state: ProcessState) => {
            // Simulating market analysis
            return {
                marketAnalysis: {
                    marketTrend: 'bullish',
                    topPerformers: ['BTC', 'ETH', 'ADA'],
                    keyEvents: ['Major adoption in country X', 'New regulation in country Y']
                }
            };
        }
    },
    {
        type: 'tool',
        name: 'fetchCryptoData',
        execute: async (state: ProcessState) => {
            // Simulating fetching crypto data
            return {
                cryptoData: {
                    BTC: { price: 50000, volume: 1000000, change24h: 5 },
                    ETH: { price: 3000, volume: 500000, change24h: 3 },
                    ADA: { price: 2, volume: 200000, change24h: 10 }
                }
            };
        }
    },
    {
        type: 'prompt',
        name: 'makeTradingDecision',
        execute: async (state: ProcessState) => {
            // Simulating trading decision based on analysis and data
            return {
                tradingDecisions: [
                    { action: 'buy', asset: 'BTC', amount: 0.1 },
                    { action: 'sell', asset: 'ETH', amount: 2 }
                ]
            };
        }
    }
];

export const cryptoTraderProcess: Process = {
    name: "CryptoTrader",
    primaryTask: "Analyze crypto market and make trading decisions",
    steps: steps,
    initialState: {
        marketAnalysis: null,
        cryptoData: null,
        tradingDecisions: [],
    },
    isComplete: (state: ProcessState) => {
        return state.tradingDecisions.length > 0;
    }
};
