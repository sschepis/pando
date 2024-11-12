import { Action, Expression } from '../types';

export function action(this: any): Action {
    this.consume('ACTION', "Expected 'action' keyword");
    this.skipWhitespace();
    const name = this.consume('IDENTIFIER', "Expected action name").value;
    this.skipWhitespace();
    this.consume('LEFT_PAREN', "Expected '(' after action name");
    this.skipWhitespace();
    const args = this.parseArguments();
    // We don't need to consume RIGHT_PAREN here as it's already consumed in parseArguments
    return { type: 'Action', name, args };
}
