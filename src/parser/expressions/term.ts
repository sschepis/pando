import { Expression } from '../types';

export function term(this: any): Expression {
    let expr = this.factor();

    while (this.match('MULTIPLY', 'DIVIDE')) {
        const operator = this.previous();
        const right = this.factor();
        expr = { type: 'BinaryExpression', operator: operator.type, left: expr, right };
    }

    return expr;
}
