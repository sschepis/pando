import { Expression } from '../types';

export function factor(this: any): Expression {
    let expr = this.unary();

    while (this.match('PLUS', 'MINUS')) {
        const operator = this.previous();
        const right = this.unary();
        expr = { type: 'BinaryExpression', operator: operator.type, left: expr, right };
    }

    return expr;
}
