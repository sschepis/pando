/**
 * Base error class for all Pando-related errors
 */
export class PandoError extends Error {
    constructor(message: string, public details?: any) {
        super(message);
        this.name = 'PandoError';
        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Error thrown during parsing of Pando files or commands
 */
export class ParseError extends PandoError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'ParseError';
    }
}

/**
 * Error thrown during execution of Pando commands or prompts
 */
export class ExecutionError extends PandoError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'ExecutionError';
    }
}

/**
 * Error thrown during AI-related operations
 */
export class AIError extends PandoError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'AIError';
    }
}

/**
 * Error thrown during tool execution
 */
export class ToolError extends PandoError {
    constructor(toolName: string, message: string, details?: any) {
        super(`Tool '${toolName}' error: ${message}`, details);
        this.name = 'ToolError';
    }
}

/**
 * Error thrown during cache operations
 */
export class CacheError extends PandoError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'CacheError';
    }
}

/**
 * Error thrown during debug operations
 */
export class DebugError extends PandoError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'DebugError';
    }
}

/**
 * Error thrown during language server operations
 */
export class LanguageServerError extends PandoError {
    constructor(message: string, details?: any) {
        super(message, details);
        this.name = 'LanguageServerError';
    }
}
