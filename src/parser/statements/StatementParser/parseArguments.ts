import { Expression } from '../../types';

export function parseArguments(this: any): Expression[] {
    this.skipWhitespace();
    const args: Expression[] = [];
    if (!this.check('RIGHT_PAREN')) {
        do {
            this.skipWhitespace();
            if (this.check('RIGHT_PAREN')) break;
            if (this.isAtEnd()) {
                throw this.error(this.peek(), "Unexpected end of input while parsing arguments");
            }
            if (this.check('IDENTIFIER')) {
                args.push({ type: 'Identifier', name: this.consume('IDENTIFIER', "Expected identifier").value });
            } else {
                const expr = this.expression();
                args.push(expr);
            }
            this.skipWhitespace();
        } while (this.match('COMMA'));
    }
    if (this.isAtEnd()) {
        throw this.error(this.peek(), "Expected ')' after arguments, found end of input");
    }
    this.consume('RIGHT_PAREN', "Expected ')' after arguments");
    return args;
}
