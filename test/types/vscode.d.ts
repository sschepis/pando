declare module 'vscode' {
    export class Position {
        readonly line: number;
        readonly character: number;
        constructor(line: number, character: number);
        
        with(line?: number, character?: number): Position;
        translate(lineDelta?: number, characterDelta?: number): Position;
        
        isEqual(other: Position): boolean;
        isAfter(other: Position): boolean;
        isBefore(other: Position): boolean;
        isAfterOrEqual(other: Position): boolean;
        isBeforeOrEqual(other: Position): boolean;
        compareTo(other: Position): number;
    }

    export class Range {
        readonly start: Position;
        readonly end: Position;
        constructor(start: Position, end: Position);
        constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number);
    }

    export interface TextDocument {
        readonly uri: { scheme: string; path: string };
        readonly version: number;
        readonly fileName: string;
        readonly languageId: string;
        readonly lineCount: number;
        getText(): string;
        getWordRangeAtPosition(position: Position): Range | undefined;
        lineAt(line: number): { text: string };
    }
}
