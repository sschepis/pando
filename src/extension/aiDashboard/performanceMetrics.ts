import { PerformanceMetrics } from './types';

export function updateMetrics(metrics: PerformanceMetrics, responseTime: number, success: boolean): PerformanceMetrics {
    const updatedMetrics = { ...metrics };
    updatedMetrics.totalQueries++;
    updatedMetrics.averageResponseTime = 
        (updatedMetrics.averageResponseTime * (updatedMetrics.totalQueries - 1) + responseTime) / 
        updatedMetrics.totalQueries;
    
    if (!success) {
        updatedMetrics.successRate = 
            (updatedMetrics.successRate * (updatedMetrics.totalQueries - 1) + 0) / 
            updatedMetrics.totalQueries;
    }

    return updatedMetrics;
}

export function getMetricsContent(metrics: PerformanceMetrics): string {
    return `
        <div>Average Response Time: ${metrics.averageResponseTime.toFixed(2)} ms</div>
        <div>Total Queries: ${metrics.totalQueries}</div>
        <div>Success Rate: ${metrics.successRate.toFixed(2)}%</div>
    `;
}
