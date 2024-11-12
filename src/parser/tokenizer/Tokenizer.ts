import { Token } from '../types';

export class Tokenizer {
    private source: string;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    constructor(source: string) {
        this.source = source;
    }

    tokenize(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push({ type: 'EOF', value: '', position: this.current });
        return this.tokens;
    }

    private scanToken(): void {
        const char = this.advance();

        switch (char) {
            case '(': this.addToken('LEFT_PAREN'); break;
            case ')': this.addToken('RIGHT_PAREN'); break;
            case '{': this.addToken('LEFT_BRACE'); break;
            case '}': this.addToken('RIGHT_BRACE'); break;
            case '[': this.addToken('LEFT_BRACKET'); break;
            case ']': this.addToken('RIGHT_BRACKET'); break;
            case ':': this.addToken('COLON'); break;
            case ',': this.addToken('COMMA'); break;
            case '>': this.addToken('GREATER'); break;
            case '<': this.addToken('LESS'); break;
            case '=': this.addToken('EQUAL'); break;
            case '+': this.addToken('PLUS'); break;
            case '-': this.addToken('MINUS'); break;
            case '*': this.addToken('MULTIPLY'); break;
            case '/': this.addToken('DIVIDE'); break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;
            case '\n':
                this.line++;
                break;
            case '"': this.string(); break;
            default:
                if (this.isDigit(char)) {
                    this.number();
                } else if (this.isAlpha(char)) {
                    this.identifier();
                } else {
                    throw new Error(`Unexpected character: ${char}`);
                }
                break;
        }
    }

    private addToken(type: string, value: string = ''): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push({ type, value: value || text, position: this.start });
    }

    private advance(): string {
        return this.source.charAt(this.current++);
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    private string(): void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            throw new Error("Unterminated string.");
        }

        // The closing ".
        this.advance();

        // Trim the surrounding quotes.
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken('STRING', value);
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();

        // Look for a fractional part.
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken('NUMBER', this.source.substring(this.start, this.current));
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        const type = this.keywords[text] || 'IDENTIFIER';
        this.addToken(type);
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') ||
               (c >= 'A' && c <= 'Z') ||
                c === '_';
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private keywords: { [key: string]: string } = {
        'prompt': 'PROMPT',
        'input': 'INPUT',
        'output': 'OUTPUT',
        'tools': 'TOOLS',
        'if': 'IF',
        'else': 'ELSE',
        'action': 'ACTION',
        'tool': 'TOOL',
        'metadata': 'METADATA',
        'parameters': 'PARAMETERS',
        'returnType': 'RETURN_TYPE',
        'implementation': 'IMPLEMENTATION'
    };
}
