import { Expression } from '../types';

export function expression(this: any): Expression {
    return this.equality();
}
