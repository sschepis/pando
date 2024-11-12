import * as vscode from 'vscode';

export interface PerformanceMetrics {
    averageResponseTime: number;
    totalQueries: number;
    successRate: number;
}

export interface Widget {
    id: string;
    title: string;
    content: string;
}

export interface AIDashboardState {
    performanceMetrics: PerformanceMetrics;
    widgets: Widget[];
    panel: vscode.WebviewPanel | undefined;
}
