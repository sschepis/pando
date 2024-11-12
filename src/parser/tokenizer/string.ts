export function string(this: any): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
        if (this.peek() === '\n') this.position++;
        this.advance();
    }

    if (this.isAtEnd()) {
        throw new Error(`Unterminated string at position ${this.position}`);
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken('STRING', value);
}
