import { Token, Statement, Expression } from '../types';
import { parse, promptDefinition, inputFormat, outputFormat, toolListing, condition, action, toolDefinition } from './';
import { parseFields } from './StatementParser/parseFields';
import { parseArguments } from './StatementParser/parseArguments';
import { expression } from './StatementParser/expression';
import { parseToolMetadata } from './StatementParser/parseToolMetadata';
import { parseParameters } from './StatementParser/parseParameters';
import { parseStringLiteral } from './StatementParser/parseStringLiteral';

export class StatementParser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse = parse.bind(this);
    promptDefinition = promptDefinition.bind(this);
    inputFormat = inputFormat.bind(this);
    outputFormat = outputFormat.bind(this);
    toolListing = toolListing.bind(this);
    condition = condition.bind(this);
    action = action.bind(this);
    toolDefinition = toolDefinition.bind(this);

    parseFields = parseFields.bind(this);
    parseArguments = parseArguments.bind(this);
    expression = expression.bind(this);
    parseToolMetadata = parseToolMetadata.bind(this);
    parseParameters = parseParameters.bind(this);
    parseStringLiteral = parseStringLiteral.bind(this);

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
        this.skipWhitespace();
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    error(token: Token, message: string): Error {
        return new Error(`${message} at token ${token.type}`);
    }
}
