import { Token, Expression } from '../types';
import { parse, expression, equality, comparison, term, factor, unary, primary } from './';

export class ExpressionParser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse = parse.bind(this);
    expression = expression.bind(this);
    equality = equality.bind(this);
    comparison = comparison.bind(this);
    term = term.bind(this);
    factor = factor.bind(this);
    unary = unary.bind(this);
    primary = primary.bind(this);

    getConsumedTokens(): number {
        return this.current;
    }

    skipWhitespace(): void {
        while (this.check('WHITESPACE')) {
            this.advance();
        }
    }

    match(...types: string[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    check(type: string): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd(): boolean {
        return this.peek().type === 'EOF';
    }

    peek(): Token {
        return this.tokens[this.current];
    }

    previous(): Token {
        return this.tokens[this.current - 1];
    }

    consume(type: string, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new Error(`${message} at token ${this.peek().type}`);
    }
}
