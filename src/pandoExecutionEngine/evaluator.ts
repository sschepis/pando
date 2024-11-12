import { ExecutionContext } from './context';
import { ExecutionError, ToolError } from '../errors';
import { log } from './logger';
import { 
    Statement, 
    Expression, 
    BinaryExpression, 
    UnaryExpression, 
    Identifier,
    CallExpression,
    MemberExpression,
    ArrayExpression,
    ObjectExpression,
    FunctionExpression,
    TemplateLiteral
} from '../parser/types';

interface EvaluationScope {
    variables: Map<string, any>;
    parent?: EvaluationScope;
}

export class Evaluator {
    private context: ExecutionContext;
    private currentScope: EvaluationScope;
    private scopeStack: EvaluationScope[] = [];

    constructor(context: ExecutionContext) {
        this.context = context;
        this.currentScope = { variables: new Map() };
    }

    async evaluateStatement(statement: Statement): Promise<any> {
        log(`Evaluating statement of type: ${statement.type}`);
        try {
            switch (statement.type) {
                case 'Action':
                    return await this.executeAction(statement.name);
                
                case 'Condition':
                    return await this.evaluateCondition(statement);
                
                case 'Loop':
                    return await this.evaluateLoop(statement);
                
                case 'Try':
                    return await this.evaluateTryCatch(statement);
                
                case 'Function':
                    return this.defineFunction(statement);
                
                case 'Return':
                    return await this.evaluateExpression(statement.value);
                
                case 'Variable':
                    return await this.evaluateVariableDeclaration(statement);
                
                case 'Expression':
                    return await this.evaluateExpression(statement.expression);
                
                default:
                    throw new ExecutionError(`Unknown statement type: ${statement.type}`);
            }
        } catch (error: unknown) {
            throw new ExecutionError(
                `Error evaluating statement: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    async evaluateExpression(expr: Expression): Promise<any> {
        try {
            switch (expr.type) {
                case 'Identifier':
                    return this.resolveIdentifier(expr);
                
                case 'StringLiteral':
                case 'NumberLiteral':
                case 'BooleanLiteral':
                    return expr.value;
                
                case 'TemplateLiteral':
                    return await this.evaluateTemplateLiteral(expr);
                
                case 'BinaryExpression':
                    return await this.evaluateBinaryExpression(expr);
                
                case 'UnaryExpression':
                    return await this.evaluateUnaryExpression(expr);
                
                case 'CallExpression':
                    return await this.evaluateCallExpression(expr);
                
                case 'MemberExpression':
                    return await this.evaluateMemberExpression(expr);
                
                case 'ArrayExpression':
                    return await this.evaluateArrayExpression(expr);
                
                case 'ObjectExpression':
                    return await this.evaluateObjectExpression(expr);
                
                case 'FunctionExpression':
                    return this.evaluateFunctionExpression(expr);
                
                case 'GroupExpression':
                    return await this.evaluateExpression(expr.expression);
                
                default:
                    throw new ExecutionError(`Unknown expression type: ${(expr as any).type}`);
            }
        } catch (error: unknown) {
            throw new ExecutionError(
                `Error evaluating expression: ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    private async evaluateCondition(statement: any): Promise<void> {
        const conditionResult = await this.evaluateExpression(statement.condition);
        this.pushScope();
        try {
            if (conditionResult) {
                for (const stmt of statement.body) {
                    await this.evaluateStatement(stmt);
                }
            } else if (statement.elseBody) {
                for (const stmt of statement.elseBody) {
                    await this.evaluateStatement(stmt);
                }
            }
        } finally {
            this.popScope();
        }
    }

    private async evaluateLoop(statement: any): Promise<void> {
        this.pushScope();
        try {
            while (await this.evaluateExpression(statement.condition)) {
                for (const stmt of statement.body) {
                    await this.evaluateStatement(stmt);
                }
            }
        } finally {
            this.popScope();
        }
    }

    private async evaluateTryCatch(statement: any): Promise<any> {
        try {
            this.pushScope();
            for (const stmt of statement.tryBody) {
                await this.evaluateStatement(stmt);
            }
        } catch (error) {
            if (statement.catchBody) {
                this.popScope();
                this.pushScope();
                if (statement.catchVariable) {
                    this.currentScope.variables.set(statement.catchVariable, error);
                }
                for (const stmt of statement.catchBody) {
                    await this.evaluateStatement(stmt);
                }
            } else {
                throw error;
            }
        } finally {
            this.popScope();
            if (statement.finallyBody) {
                this.pushScope();
                try {
                    for (const stmt of statement.finallyBody) {
                        await this.evaluateStatement(stmt);
                    }
                } finally {
                    this.popScope();
                }
            }
        }
    }

    private defineFunction(statement: any): void {
        const func = this.evaluateFunctionExpression(statement.function);
        this.currentScope.variables.set(statement.name, func);
    }

    private async evaluateVariableDeclaration(statement: any): Promise<void> {
        const value = await this.evaluateExpression(statement.initializer);
        this.currentScope.variables.set(statement.name, value);
    }

    private async evaluateTemplateLiteral(expr: TemplateLiteral): Promise<string> {
        const parts = await Promise.all(expr.expressions.map(e => this.evaluateExpression(e)));
        return expr.quasis.reduce((result, quasi, i) => 
            result + quasi + (i < parts.length ? String(parts[i]) : ''), '');
    }

    private async evaluateCallExpression(expr: CallExpression): Promise<any> {
        const func = await this.evaluateExpression(expr.callee);
        const args = await Promise.all(expr.arguments.map(arg => this.evaluateExpression(arg)));
        
        if (typeof func !== 'function') {
            throw new ExecutionError(`${expr.callee.type === 'Identifier' ? expr.callee.name : 'Expression'} is not a function`);
        }

        return func.apply(null, args);
    }

    private async evaluateMemberExpression(expr: MemberExpression): Promise<any> {
        const object = await this.evaluateExpression(expr.object);
        const property = expr.computed 
            ? await this.evaluateExpression(expr.property)
            : (expr.property as Identifier).name;

        if (object == null) {
            throw new ExecutionError(`Cannot read property '${property}' of ${object}`);
        }

        return object[property];
    }

    private async evaluateArrayExpression(expr: ArrayExpression): Promise<any[]> {
        return Promise.all(expr.elements.map(element => this.evaluateExpression(element)));
    }

    private async evaluateObjectExpression(expr: ObjectExpression): Promise<object> {
        const obj: any = {};
        for (const prop of expr.properties) {
            const key = prop.computed 
                ? await this.evaluateExpression(prop.key)
                : (prop.key as Identifier).name;
            obj[key] = await this.evaluateExpression(prop.value);
        }
        return obj;
    }

    private evaluateFunctionExpression(expr: FunctionExpression): Function {
        const scope = this.currentScope;
        return (...args: any[]) => {
            this.pushScope(scope);
            try {
                expr.params.forEach((param, i) => {
                    this.currentScope.variables.set(param.name, args[i]);
                });
                return this.evaluateStatement(expr.body);
            } finally {
                this.popScope();
            }
        };
    }

    private resolveIdentifier(expr: Identifier): any {
        let scope: EvaluationScope | undefined = this.currentScope;
        while (scope) {
            if (scope.variables.has(expr.name)) {
                return scope.variables.get(expr.name);
            }
            scope = scope.parent;
        }
        return this.context.variables[expr.name];
    }

    private pushScope(parent: EvaluationScope = this.currentScope): void {
        const newScope = { variables: new Map(), parent };
        this.scopeStack.push(this.currentScope);
        this.currentScope = newScope;
    }

    private popScope(): void {
        if (this.scopeStack.length === 0) {
            throw new ExecutionError('Cannot pop scope: scope stack is empty');
        }
        this.currentScope = this.scopeStack.pop()!;
    }

    // ... rest of the class implementation (executeAction, executeTool, etc.) remains the same
}
