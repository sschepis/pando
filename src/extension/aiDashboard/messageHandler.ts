import * as vscode from 'vscode';
import { AIAssistant } from '../../ai/AIAssistant';
import { AIDashboardState } from './types';
import { updateMetrics, getMetricsContent } from './performanceMetrics';
import { updateWidgets, addWidget, removeWidget, getWidgetHtml } from './widgetManager';

export async function handleMessage(
    message: any,
    state: AIDashboardState,
    aiAssistant: AIAssistant
): Promise<AIDashboardState> {
    let updatedState = { ...state };

    switch (message.command) {
        case 'sendQuery':
            const startTime = Date.now();
            try {
                const result = await aiAssistant.processQuery(message.text);
                const endTime = Date.now();
                updatedState.performanceMetrics = updateMetrics(state.performanceMetrics, endTime - startTime, result.taskCompleted);
                updatedState.widgets = updateWidgets(state.widgets, message.text, result.response);
                state.panel?.webview.postMessage({ command: 'updateOutput', text: `AI: ${result.response}` });
            } catch (error) {
                const endTime = Date.now();
                updatedState.performanceMetrics = updateMetrics(state.performanceMetrics, endTime - startTime, false);
                state.panel?.webview.postMessage({ command: 'updateOutput', text: `Error: ${error}` });
            }
            break;
        case 'addWidget':
            updatedState.widgets = addWidget(state.widgets);
            const newWidget = updatedState.widgets[updatedState.widgets.length - 1];
            state.panel?.webview.postMessage({ 
                command: 'addWidget', 
                widgetHtml: getWidgetHtml(newWidget) 
            });
            break;
        case 'removeWidget':
            updatedState.widgets = removeWidget(state.widgets, message.id);
            state.panel?.webview.postMessage({ command: 'removeWidget', id: message.id });
            break;
    }

    // Update metrics widget
    const metricsWidget = updatedState.widgets.find(w => w.id === 'metrics');
    if (metricsWidget) {
        const metricsContent = getMetricsContent(updatedState.performanceMetrics);
        updatedState.widgets = updateWidgets(updatedState.widgets, 'metrics', metricsContent);
        state.panel?.webview.postMessage({ 
            command: 'updateWidget', 
            id: 'metrics', 
            content: metricsContent 
        });
    }

    return updatedState;
}
