import { Token } from '../../types';

interface Field {
    name: string;
    type: string;
}

export function parseFields(this: any): Field[] {
    this.skipWhitespace();
    const fields: Field[] = [];
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
        const name = this.consume('IDENTIFIER', "Expected field name.");
        this.skipWhitespace();
        this.consume('COLON', "Expected ':' after field name.");
        this.skipWhitespace();
        const type = this.consume('IDENTIFIER', "Expected field type.");
        fields.push({ name: name.value, type: type.value });
        this.skipWhitespace();
        if (this.match('COMMA')) {
            this.skipWhitespace();
        } else if (!this.check('RIGHT_BRACE')) {
            throw this.error(this.peek(), "Expected ',' or '}' after field");
        }
    }
    return fields;
}
