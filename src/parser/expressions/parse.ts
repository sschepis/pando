import { Expression } from '../types';

export function parse(this: any): Expression {
    this.skipWhitespace();
    return this.expression();
}

export function expression(this: any): Expression {
    return this.equality();
}
