import { PandoPrompt } from './types';
import { ParseError } from '../errors';
import { log } from './logger';

interface ParserState {
    currentSection: string | null;
    currentIndent: number;
    inMultiLineString: boolean;
    multiLineBuffer: string[];
    lineNumber: number;
}

interface ParserContext {
    fileName?: string;
    source?: string;
}

export function parsePrompt(promptContent: string, context?: ParserContext): PandoPrompt {
    log('Parsing prompt content');
    try {
        // Basic validation
        if (!promptContent.trim()) {
            throw createParseError('Empty prompt content', 1);
        }

        const lines = promptContent.split('\n');
        const state: ParserState = {
            currentSection: null,
            currentIndent: 0,
            inMultiLineString: false,
            multiLineBuffer: [],
            lineNumber: 0
        };

        const prompt: Partial<PandoPrompt> = {};
        
        for (let i = 0; i < lines.length; i++) {
            state.lineNumber = i + 1;
            const line = lines[i];
            
            try {
                parseLine(line, state, prompt);
            } catch (error) {
                throw createParseError(
                    `Error on line ${state.lineNumber}: ${error instanceof Error ? error.message : String(error)}`,
                    state.lineNumber,
                    line
                );
            }
        }

        // Handle unclosed multi-line string
        if (state.inMultiLineString) {
            throw createParseError('Unclosed multi-line string', state.lineNumber);
        }

        validatePrompt(prompt, state.lineNumber);
        return prompt as PandoPrompt;
    } catch (error) {
        if (error instanceof ParseError) {
            throw error;
        }
        throw createParseError(
            `Failed to parse prompt: ${error instanceof Error ? error.message : String(error)}`,
            0
        );
    }
}

function parseLine(line: string, state: ParserState, prompt: Partial<PandoPrompt>): void {
    const trimmedLine = line.trimRight();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
    }

    // Handle multi-line strings
    if (state.inMultiLineString) {
        if (isMultiLineStringDelimiter(trimmedLine)) {
            state.inMultiLineString = false;
            const value = state.multiLineBuffer.join('\n');
            setPromptValue(prompt, state.currentSection!, value);
            state.multiLineBuffer = [];
        } else {
            state.multiLineBuffer.push(line); // Use original line to preserve indentation
        }
        return;
    }

    const indent = line.search(/\S/);
    
    // Handle section starts
    if (indent === 0) {
        parseTopLevelSection(trimmedLine, state, prompt);
        return;
    }

    // Handle nested content
    if (indent > state.currentIndent) {
        parseNestedContent(trimmedLine, indent, state, prompt);
        return;
    }

    // Handle same-level content
    parseSameLevelContent(trimmedLine, indent, state, prompt);
}

function parseTopLevelSection(line: string, state: ParserState, prompt: Partial<PandoPrompt>): void {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();

    state.currentSection = key;
    state.currentIndent = 0;

    if (isMultiLineStringDelimiter(value)) {
        state.inMultiLineString = true;
        state.multiLineBuffer = [];
    } else if (value) {
        setPromptValue(prompt, key, value);
    } else {
        setPromptValue(prompt, key, {});
    }
}

function parseNestedContent(line: string, indent: number, state: ParserState, prompt: Partial<PandoPrompt>): void {
    if (!state.currentSection) {
        throw new Error('Nested content without a section');
    }

    const [key, ...valueParts] = line.trim().split(':');
    const value = valueParts.join(':').trim();
    const section = getPromptValue(prompt, state.currentSection);

    if (typeof section !== 'object') {
        throw new Error(`Cannot add nested content to non-object section: ${state.currentSection}`);
    }

    if (isMultiLineStringDelimiter(value)) {
        state.inMultiLineString = true;
        state.multiLineBuffer = [];
        state.currentIndent = indent;
    } else {
        section[key] = value || {};
        state.currentIndent = indent;
    }
}

function parseSameLevelContent(line: string, indent: number, state: ParserState, prompt: Partial<PandoPrompt>): void {
    if (!state.currentSection) {
        throw new Error('Content without a section');
    }

    const [key, ...valueParts] = line.trim().split(':');
    const value = valueParts.join(':').trim();
    const section = getPromptValue(prompt, state.currentSection);

    if (typeof section !== 'object') {
        throw new Error(`Cannot add content to non-object section: ${state.currentSection}`);
    }

    if (isMultiLineStringDelimiter(value)) {
        state.inMultiLineString = true;
        state.multiLineBuffer = [];
    } else {
        section[key] = value || {};
    }
    state.currentIndent = indent;
}

function validatePrompt(prompt: Partial<PandoPrompt>, lineNumber: number): void {
    const requiredFields = {
        name: 'Prompt name',
        systemPrompt: 'System prompt',
        userPrompt: 'User prompt',
        input: 'Input section',
        output: 'Output section'
    };

    for (const [field, description] of Object.entries(requiredFields)) {
        if (!prompt[field as keyof PandoPrompt]) {
            throw createParseError(`${description} not found`, lineNumber);
        }
    }

    validatePromptStructure(prompt as PandoPrompt, lineNumber);
}

function validatePromptStructure(prompt: PandoPrompt, lineNumber: number): void {
    // Validate input/output structure
    if (typeof prompt.input !== 'object' || Array.isArray(prompt.input)) {
        throw createParseError('Input section must be an object', lineNumber);
    }

    if (typeof prompt.output !== 'object' || Array.isArray(prompt.output)) {
        throw createParseError('Output section must be an object', lineNumber);
    }

    // Validate conditions if present
    if (prompt.conditions && (typeof prompt.conditions !== 'object' || Array.isArray(prompt.conditions))) {
        throw createParseError('Conditions section must be an object', lineNumber);
    }

    // Validate actions if present
    if (prompt.actions && (typeof prompt.actions !== 'object' || Array.isArray(prompt.actions))) {
        throw createParseError('Actions section must be an object', lineNumber);
    }
}

function isMultiLineStringDelimiter(line: string): boolean {
    return line.trim() === '"""' || line.trim() === "'''";
}

function setPromptValue(prompt: any, key: string, value: any): void {
    const parts = key.split('.');
    let current = prompt;
    
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
            current[part] = {};
        }
        current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
}

function getPromptValue(prompt: any, key: string): any {
    const parts = key.split('.');
    let current = prompt;
    
    for (const part of parts) {
        if (!(part in current)) {
            return undefined;
        }
        current = current[part];
    }
    
    return current;
}

function createParseError(message: string, line: number, lineContent?: string): ParseError {
    const details = lineContent ? `\nLine ${line}: ${lineContent}` : '';
    return new ParseError(`${message}${details}`);
}
