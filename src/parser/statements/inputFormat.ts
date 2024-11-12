import { InputFormat } from '../types';

export function inputFormat(this: any): InputFormat {
    this.consume('INPUT', "Expected 'input' keyword");
    this.skipWhitespace();
    this.consume('LEFT_BRACE', "Expected '{' after 'input'");
    const fields = this.parseFields();
    this.consume('RIGHT_BRACE', "Expected '}' after input fields");
    return { type: 'InputFormat', fields };
}
