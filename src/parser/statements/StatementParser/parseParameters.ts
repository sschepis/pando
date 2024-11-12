interface Parameter {
    name: string;
    type: string;
    description: string;
}

export function parseParameters(this: any): Parameter[] {
    this.consume('LEFT_BRACKET', "Expected '[' after 'parameters'");
    const parameters: Parameter[] = [];
    while (!this.check('RIGHT_BRACKET') && !this.isAtEnd()) {
        this.consume('LEFT_BRACE', "Expected '{' for parameter");
        const name = this.parseStringLiteral("Expected parameter name");
        this.consume('COLON', "Expected ':' after parameter name");
        const type = this.parseStringLiteral("Expected parameter type");
        this.consume('COMMA', "Expected ',' after parameter type");
        const description = this.parseStringLiteral("Expected parameter description");
        this.consume('RIGHT_BRACE', "Expected '}' after parameter");
        parameters.push({ name, type, description });
        if (!this.check('RIGHT_BRACKET')) {
            this.consume('COMMA', "Expected ',' between parameters");
        }
    }
    this.consume('RIGHT_BRACKET', "Expected ']' after parameters");
    return parameters;
}
