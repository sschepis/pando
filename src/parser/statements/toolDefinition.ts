import { ToolDefinition } from '../types';

interface Parameter {
    name: string;
    type: string;
    description: string;
}

interface ToolMetadata {
    description: string;
    parameters: Parameter[];
    returnType: string;
}

export function toolDefinition(this: any): ToolDefinition {
    this.consume('TOOL', "Expected 'tool' keyword");
    this.skipWhitespace();
    const name = this.consume('IDENTIFIER', "Expected tool name").value;
    this.skipWhitespace();
    this.consume('LEFT_BRACE', "Expected '{' after tool name");
    this.skipWhitespace();

    this.consume('METADATA', "Expected 'metadata' keyword");
    const metadata = this.parseToolMetadata();

    this.skipWhitespace();
    this.consume('IMPLEMENTATION', "Expected 'implementation' keyword");
    const implementation = this.parseStringLiteral("Expected implementation string");

    this.skipWhitespace();
    this.consume('RIGHT_BRACE', "Expected '}' after tool definition");

    return {
        type: 'ToolDefinition',
        name,
        metadata,
        implementation
    };
}

function parseToolMetadata(this: any): ToolMetadata {
    this.consume('LEFT_BRACE', "Expected '{' after 'metadata'");
    this.skipWhitespace();
    const description = this.parseStringLiteral("Expected description string");
    this.skipWhitespace();
    
    this.consume('PARAMETERS', "Expected 'parameters' keyword");
    this.skipWhitespace();
    const parameters = this.parseParameters();
    this.skipWhitespace();

    this.consume('RETURN_TYPE', "Expected 'returnType' keyword");
    this.skipWhitespace();
    const returnType = this.parseStringLiteral("Expected return type string");
    this.skipWhitespace();

    this.consume('RIGHT_BRACE', "Expected '}' after metadata");

    return { description, parameters, returnType };
}

function parseParameters(this: any): Parameter[] {
    this.consume('LEFT_BRACKET', "Expected '[' after 'parameters'");
    this.skipWhitespace();
    const parameters: Parameter[] = [];
    while (!this.check('RIGHT_BRACKET') && !this.isAtEnd()) {
        this.consume('LEFT_BRACE', "Expected '{' for parameter");
        this.skipWhitespace();
        const name = this.parseStringLiteral("Expected parameter name");
        this.skipWhitespace();
        this.consume('COLON', "Expected ':' after parameter name");
        this.skipWhitespace();
        const type = this.parseStringLiteral("Expected parameter type");
        this.skipWhitespace();
        this.consume('COMMA', "Expected ',' after parameter type");
        this.skipWhitespace();
        const description = this.parseStringLiteral("Expected parameter description");
        this.skipWhitespace();
        this.consume('RIGHT_BRACE', "Expected '}' after parameter");
        parameters.push({ name, type, description });
        this.skipWhitespace();
        if (!this.check('RIGHT_BRACKET')) {
            this.consume('COMMA', "Expected ',' between parameters");
            this.skipWhitespace();
        }
    }
    this.consume('RIGHT_BRACKET', "Expected ']' after parameters");
    return parameters;
}
