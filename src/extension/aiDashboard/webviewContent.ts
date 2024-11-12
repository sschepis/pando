import { Widget } from './types';
import { getWidgetHtml } from './widgetManager';

export function getWebviewContent(widgets: Widget[]): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Assistant Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                #output { white-space: pre-wrap; background-color: #f0f0f0; padding: 10px; margin-top: 10px; }
                .widget { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
                .widget-header { display: flex; justify-content: space-between; align-items: center; }
                .widget-content { margin-top: 10px; }
                .prompt { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                .prompt-text { flex-grow: 1; }
                .prompt-tags { margin-right: 10px; }
                .tag { background-color: #e0e0e0; padding: 2px 5px; margin-right: 5px; border-radius: 3px; }
                .favorite-btn, .delete-btn { margin-left: 5px; }
            </style>
        </head>
        <body>
            <h1>AI Assistant Dashboard</h1>
            <input id="userInput" type="text" placeholder="Enter your query here">
            <button id="sendButton">Send</button>
            <div id="output"></div>
            <div id="widgets">
                ${widgets.map(widget => getWidgetHtml(widget)).join('')}
            </div>
            <button id="addWidget">Add Widget</button>
            <script>
                const vscode = acquireVsCodeApi();
                const userInput = document.getElementById('userInput');
                const sendButton = document.getElementById('sendButton');
                const output = document.getElementById('output');
                const addWidgetButton = document.getElementById('addWidget');

                sendButton.addEventListener('click', () => {
                    const query = userInput.value;
                    vscode.postMessage({ command: 'sendQuery', text: query });
                    vscode.postMessage({ command: 'addPrompt', text: query, tags: [] });
                });

                addWidgetButton.addEventListener('click', () => {
                    vscode.postMessage({ command: 'addWidget' });
                });

                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('remove-widget')) {
                        const widgetId = e.target.getAttribute('data-id');
                        vscode.postMessage({ command: 'removeWidget', id: widgetId });
                    } else if (e.target.classList.contains('favorite-btn')) {
                        const promptId = e.target.closest('.prompt').getAttribute('data-id');
                        vscode.postMessage({ command: 'toggleFavorite', id: promptId });
                    } else if (e.target.classList.contains('delete-btn')) {
                        const promptId = e.target.closest('.prompt').getAttribute('data-id');
                        vscode.postMessage({ command: 'deletePrompt', id: promptId });
                    } else if (e.target.id === 'search-btn') {
                        const searchQuery = document.getElementById('prompt-search').value;
                        const tagSearch = document.getElementById('tag-search').value;
                        const searchTags = tagSearch.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                        vscode.postMessage({ command: 'searchPrompts', query: searchQuery, tags: searchTags });
                    }
                });

                document.addEventListener('keyup', (e) => {
                    if (e.target.id === 'prompt-search' || e.target.id === 'tag-search') {
                        const searchQuery = document.getElementById('prompt-search').value;
                        const tagSearch = document.getElementById('tag-search').value;
                        const searchTags = tagSearch.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                        vscode.postMessage({ command: 'searchPrompts', query: searchQuery, tags: searchTags });
                    }
                });

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateOutput':
                            output.textContent += message.text + '\\n';
                            break;
                        case 'updateWidget':
                            const widget = document.getElementById(message.id);
                            if (widget) {
                                if (message.id === 'promptManager') {
                                    widget.querySelector('#prompt-list').innerHTML = message.promptsHtml;
                                } else {
                                    widget.querySelector('.widget-content').innerHTML = message.content;
                                }
                            }
                            break;
                        case 'addWidget':
                            const widgetsContainer = document.getElementById('widgets');
                            widgetsContainer.innerHTML += message.widgetHtml;
                            break;
                        case 'removeWidget':
                            const widgetToRemove = document.getElementById(message.id);
                            if (widgetToRemove) {
                                widgetToRemove.remove();
                            }
                            break;
                    }
                });
            </script>
        </body>
        </html>
    `;
}
