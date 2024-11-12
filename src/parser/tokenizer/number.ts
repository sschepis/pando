export function number(this: any): void {
    while (this.isDigit(this.peek())) this.advance();

    // Look for a fractional part.
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
        // Consume the "."
        this.advance();

        while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken('NUMBER',
        parseFloat(this.source.substring(this.start, this.current)));
}
