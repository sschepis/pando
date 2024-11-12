import { Expression, BinaryExpression } from '../types';

export function comparison(this: any): Expression {
    let expr = this.primary();

    while (this.match('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL', 'EQUAL_EQUAL', 'BANG_EQUAL', 'EQUAL')) {
        let operator = this.previous().type;
        if (operator === 'EQUAL') {
            // If we encounter a single '=', treat it as '=='
            operator = 'EQUAL_EQUAL';
            // Optionally consume another '=' if it's there
            this.match('EQUAL');
        }
        const right = this.primary();
        expr = { type: 'BinaryExpression', operator, left: expr, right } as BinaryExpression;
    }

    return expr;
}
