import { Statement } from '../types';

export function parse(this: any): Statement {
    this.skipWhitespace();
    if (this.check('PROMPT')) {
        return this.promptDefinition();
    } else if (this.check('INPUT')) {
        return this.inputFormat();
    } else if (this.check('OUTPUT')) {
        return this.outputFormat();
    } else if (this.check('TOOLS')) {
        return this.toolListing();
    } else if (this.check('IF')) {
        return this.condition();
    } else if (this.check('ACTION')) {
        return this.action();
    } else if (this.check('TOOL')) {
        return this.toolDefinition();
    } else {
        throw this.error(this.peek(), "Expected statement");
    }
}
