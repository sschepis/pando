import { PromptDefinition, Statement } from '../types';

export function promptDefinition(this: any): PromptDefinition {
    this.consume('PROMPT', "Expected 'prompt' keyword");
    const name = this.consume('IDENTIFIER', "Expected prompt name").value;
    this.consume('LEFT_BRACE', "Expected '{' after prompt name");
    
    const body: Statement[] = [];
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
        this.skipWhitespace();
        if (this.check('ACTION') || this.check('INPUT') || this.check('OUTPUT')) {
            body.push(this.parse());
        } else {
            throw this.error(this.peek(), "Expected 'action', 'input', or 'output' in prompt definition");
        }
        this.skipWhitespace();
    }
    
    this.consume('RIGHT_BRACE', "Expected '}' after prompt body");
    
    return { type: 'PromptDefinition', name, body };
}
