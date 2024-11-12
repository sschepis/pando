export function scanToken(this: any): void {
    const char = this.advance();
    switch (char) {
        case '(': this.addToken('LEFT_PAREN'); break;
        case ')': this.addToken('RIGHT_PAREN'); break;
        case '{': this.addToken('LEFT_BRACE'); break;
        case '}': this.addToken('RIGHT_BRACE'); break;
        case '[': this.addToken('LEFT_BRACKET'); break;
        case ']': this.addToken('RIGHT_BRACKET'); break;
        case ',': this.addToken('COMMA'); break;
        case '.': this.addToken('DOT'); break;
        case '-': this.addToken('MINUS'); break;
        case '+': this.addToken('PLUS'); break;
        case ';': this.addToken('SEMICOLON'); break;
        case '*': this.addToken('STAR'); break;
        case '!': this.addToken(this.match('=') ? 'BANG_EQUAL' : 'BANG'); break;
        case '=': this.addToken(this.match('=') ? 'EQUAL_EQUAL' : 'EQUAL'); break;
        case '<': this.addToken(this.match('=') ? 'LESS_EQUAL' : 'LESS'); break;
        case '>': this.addToken(this.match('=') ? 'GREATER_EQUAL' : 'GREATER'); break;
        case '/':
            if (this.match('/')) {
                // A comment goes until the end of the line.
                while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
            } else {
                this.addToken('SLASH');
            }
            break;
        case ' ':
        case '\r':
        case '\t':
            // Ignore whitespace.
            break;
        case '\n':
            this.position++;
            break;
        case '"': this.string(); break;
        default:
            if (this.isDigit(char)) {
                this.number();
            } else if (this.isAlpha(char)) {
                this.identifier();
            } else {
                throw new Error(`Unexpected character: ${char} at position ${this.position}`);
            }
            break;
    }
}
