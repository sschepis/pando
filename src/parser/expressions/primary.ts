import { Expression, Identifier, StringLiteral, NumberLiteral, BooleanLiteral, GroupExpression } from '../types';

export function primary(this: any): Expression {
    if (this.match('IDENTIFIER')) {
        return { type: 'Identifier', name: this.previous().value } as Identifier;
    }
    if (this.match('STRING')) {
        return { type: 'StringLiteral', value: this.previous().value } as StringLiteral;
    }
    if (this.match('NUMBER')) {
        return { type: 'NumberLiteral', value: parseFloat(this.previous().value) } as NumberLiteral;
    }
    if (this.match('TRUE')) {
        return { type: 'BooleanLiteral', value: true } as BooleanLiteral;
    }
    if (this.match('FALSE')) {
        return { type: 'BooleanLiteral', value: false } as BooleanLiteral;
    }
    if (this.match('LEFT_PAREN')) {
        const expr = this.expression();
        this.consume('RIGHT_PAREN', "Expected ')' after expression.");
        return { type: 'GroupExpression', expression: expr } as GroupExpression;
    }

    throw this.error(this.peek(), "Expected expression.");
}
