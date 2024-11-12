import { Token } from '../types';

export function tokenize(this: any): Token[] {
    const keywords: { [key: string]: string } = {
        'prompt': 'PROMPT',
        'input': 'INPUT',
        'output': 'OUTPUT',
        'tools': 'TOOLS',
        'if': 'IF',
        'else': 'ELSE',
        'action': 'ACTION',
        'true': 'TRUE',
        'false': 'FALSE',
        'tool': 'TOOL',
        'metadata': 'METADATA',
        'parameters': 'PARAMETERS',
        'returnType': 'RETURN_TYPE',
        'implementation': 'IMPLEMENTATION'
    };

    while (this.current < this.source.length) {
        this.start = this.current;
        this.scanToken();
    }

    this.tokens.push({ type: 'EOF', value: '', position: this.position });
    return this.tokens;
}
