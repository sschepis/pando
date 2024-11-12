export function parseToolMetadata(this: any): any {
    this.consume('LEFT_BRACE', "Expected '{' after 'metadata'");
    this.skipWhitespace();
    
    this.consume('STRING', "Expected 'description' key");
    this.skipWhitespace();
    this.consume('COLON', "Expected ':' after 'description'");
    this.skipWhitespace();
    const description = this.parseStringLiteral("Expected description string");
    this.skipWhitespace();
    this.consume('COMMA', "Expected ',' after description");
    this.skipWhitespace();
    
    this.consume('PARAMETERS', "Expected 'parameters' keyword");
    this.skipWhitespace();
    this.consume('COLON', "Expected ':' after 'parameters'");
    this.skipWhitespace();
    const parameters = this.parseParameters();
    this.skipWhitespace();
    this.consume('COMMA', "Expected ',' after parameters");
    this.skipWhitespace();

    this.consume('RETURN_TYPE', "Expected 'returnType' keyword");
    this.skipWhitespace();
    this.consume('COLON', "Expected ':' after 'returnType'");
    this.skipWhitespace();
    const returnType = this.parseStringLiteral("Expected return type string");
    this.skipWhitespace();

    this.consume('RIGHT_BRACE', "Expected '}' after metadata");

    return { description, parameters, returnType };
}
