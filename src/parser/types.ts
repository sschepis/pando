export type Token = {
    type: string;
    value: string;
    position: number;
};

export type Identifier = { type: 'Identifier'; name: string };
export type BinaryExpression = { type: 'BinaryExpression'; operator: string; left: Expression; right: Expression };
export type UnaryExpression = { type: 'UnaryExpression'; operator: string; right: Expression };
export type StringLiteral = { type: 'StringLiteral'; value: string };
export type NumberLiteral = { type: 'NumberLiteral'; value: number };
export type BooleanLiteral = { type: 'BooleanLiteral'; value: boolean };
export type GroupExpression = { type: 'GroupExpression'; expression: Expression };

export type Expression =
    | Identifier
    | BinaryExpression
    | UnaryExpression
    | StringLiteral
    | NumberLiteral
    | BooleanLiteral
    | GroupExpression;

export type Action = { type: 'Action'; name: string; args: Expression[] };
export type Condition = { type: 'Condition'; condition: Expression; body: Statement[]; elseBody: Statement[] | null };
export type PromptDefinition = { type: 'PromptDefinition'; name: string; body: Statement[] };
export type InputFormat = { type: 'InputFormat'; fields: { name: string; type: string }[] };
export type OutputFormat = { type: 'OutputFormat'; fields: { name: string; type: string }[] };
export type ToolListing = { type: 'ToolListing'; tools: string[] };
export type ToolDefinition = { type: 'ToolDefinition'; name: string; metadata: any; implementation: string };

export type Statement =
    | Action
    | Condition
    | PromptDefinition
    | InputFormat
    | OutputFormat
    | ToolListing
    | ToolDefinition;
