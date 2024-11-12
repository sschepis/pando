export function identifier(this: any): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    const type = this.keywords[text] || 'IDENTIFIER';
    this.addToken(type);
}
