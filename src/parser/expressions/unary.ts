import { Expression } from '../types';

export function unary(this: any): Expression {
    if (this.match('MINUS', 'NOT')) {
        const operator = this.previous();
        const right = this.unary();
        return { type: 'UnaryExpression', operator: operator.type, right };
    }

    return this.primary();
}
