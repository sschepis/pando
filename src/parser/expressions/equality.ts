import { Expression, BinaryExpression } from '../types';

export function equality(this: any): Expression {
    let expr = this.comparison();

    while (this.match('BANG_EQUAL', 'EQUAL_EQUAL')) {
        const operator = this.previous().type;
        const right = this.comparison();
        expr = { type: 'BinaryExpression', operator, left: expr, right } as BinaryExpression;
    }

    return expr;
}
