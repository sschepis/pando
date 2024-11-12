import * as vscode from 'vscode';

export class VSCodeLogger {
    private outputChannel: vscode.OutputChannel;

    constructor(channelName: string) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }

    private log(level: string, message: string, ...meta: any[]) {
        const timestamp = new Date().toISOString();
        let logMessage = `${timestamp} [${level}] ${message}`;
        if (meta.length > 0) {
            logMessage += ` ${JSON.stringify(meta)}`;
        }
        this.outputChannel.appendLine(logMessage);
    }

    info(message: string, ...meta: any[]) {
        this.log('INFO', message, ...meta);
    }

    warn(message: string, ...meta: any[]) {
        this.log('WARN', message, ...meta);
    }

    error(message: string, ...meta: any[]) {
        this.log('ERROR', message, ...meta);
    }

    debug(message: string, ...meta: any[]) {
        this.log('DEBUG', message, ...meta);
    }
}

export function createLogger(context: vscode.ExtensionContext): VSCodeLogger {
    return new VSCodeLogger('Pando');
}
