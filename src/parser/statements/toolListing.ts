import { ToolListing } from '../types';

export function toolListing(this: any): ToolListing {
    this.consume('TOOLS', "Expected 'tools' keyword");
    this.skipWhitespace();
    this.consume('LEFT_BRACE', "Expected '{' after 'tools'");
    
    const tools: string[] = [];
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
        this.skipWhitespace();
        const tool = this.consume('IDENTIFIER', "Expected tool name");
        tools.push(tool.value);
        this.skipWhitespace();
        if (!this.check('RIGHT_BRACE')) {
            this.consume('COMMA', "Expected ',' between tool names");
        }
    }
    
    this.consume('RIGHT_BRACE', "Expected '}' after tool names");
    return { type: 'ToolListing', tools };
}
