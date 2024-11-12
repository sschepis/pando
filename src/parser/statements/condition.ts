import { Condition, Statement, Expression } from '../types';

export function condition(this: any): Condition {
    this.consume('IF', "Expected 'if' keyword");
    this.skipWhitespace();
    this.consume('LEFT_PAREN', "Expected '(' after 'if'");
    
    const conditionExpr = this.expression();
    
    this.consume('RIGHT_PAREN', "Expected ')' after condition");
    this.skipWhitespace();
    this.consume('LEFT_BRACE', "Expected '{' before if body");
    
    const body: Statement[] = [];
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
        this.skipWhitespace();
        body.push(this.parse());
        this.skipWhitespace();
    }
    this.consume('RIGHT_BRACE', "Expected '}' after if body");

    let elseBody: Statement[] | null = null;
    if (this.match('ELSE')) {
        this.skipWhitespace();
        this.consume('LEFT_BRACE', "Expected '{' before else body");
        elseBody = [];
        while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
            this.skipWhitespace();
            elseBody.push(this.parse());
            this.skipWhitespace();
        }
        this.consume('RIGHT_BRACE', "Expected '}' after else body");
    }

    return { type: 'Condition', condition: conditionExpr, body, elseBody };
}
