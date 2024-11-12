import { PandoContext } from './types';
import { log } from './logger';

export class ExecutionContext implements PandoContext {
    variables: { [key: string]: any };
    tools: { [key: string]: Function };

    constructor() {
        this.variables = {};
        this.tools = {};
    }

    setVariable(name: string, value: any) {
        log(`Setting variable: ${name} = ${value}`);
        this.variables[name] = value;
    }

    getVariable(name: string): any {
        const value = this.variables[name];
        log(`Getting variable: ${name} = ${value}`);
        return value;
    }

    registerTool(name: string, implementation: Function) {
        log(`Registering tool: ${name}`);
        this.tools[name] = implementation;
    }

    getTool(name: string): Function | undefined {
        return this.tools[name];
    }
}
