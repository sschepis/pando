import { Expression } from '../../types';
import { ExpressionParser } from '../../expressions/ExpressionParser';

export function expression(this: any): Expression {
    const expr = new ExpressionParser(this.tokens.slice(this.current));
    const result = expr.parse();
    this.current += expr.getConsumedTokens();
    return result;
}
