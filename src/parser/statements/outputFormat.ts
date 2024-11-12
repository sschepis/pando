import { OutputFormat } from '../types';

export function outputFormat(this: any): OutputFormat {
    this.consume('OUTPUT', "Expected 'output' keyword");
    this.skipWhitespace();
    this.consume('LEFT_BRACE', "Expected '{' after 'output'");
    const fields = this.parseFields();
    this.consume('RIGHT_BRACE', "Expected '}' after output fields");
    return { type: 'OutputFormat', fields };
}
