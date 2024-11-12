import * as vscode from 'vscode';
import { Widget } from './types';

export function updateWidgetContent(widgets: Widget[], id: string, content: string, append: boolean = false): Widget[] {
    return widgets.map(widget => {
        if (widget.id === id) {
            return {
                ...widget,
                content: append ? content + widget.content : content
            };
        }
        return widget;
    });
}

export function addWidget(widgets: Widget[]): Widget[] {
    const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        title: 'New Widget',
        content: 'This is a new widget. Customize me!'
    };
    return [...widgets, newWidget];
}

export function removeWidget(widgets: Widget[], id: string): Widget[] {
    return widgets.filter(w => w.id !== id);
}

export function getWidgetHtml(widget: Widget): string {
    return `
        <div class="widget" id="${widget.id}">
            <div class="widget-header">
                <h3>${widget.title}</h3>
                <button class="remove-widget" data-id="${widget.id}">Remove</button>
            </div>
            <div class="widget-content">${widget.content}</div>
        </div>
    `;
}

export function updateWidgets(widgets: Widget[], query: string, response: string): Widget[] {
    return updateWidgetContent(
        widgets,
        'history',
        `<div><strong>Q:</strong> ${query}</div><div><strong>A:</strong> ${response}</div>`,
        true
    );
}
