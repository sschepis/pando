import { Tokenizer } from './tokenizer/Tokenizer';
import { StatementParser } from './statements/StatementParser';
import { PandoParser } from './parser';

function testParse(input: string): void {
    console.log(`\nTesting input: ${input}`);
    try {
        const tokenizer = new Tokenizer(input);
        const tokens = tokenizer.tokenize();
        console.log('Tokens:', tokens.map(t => `${t.type}(${t.value})`).join(', '));

        const statementParser = new StatementParser(tokens);
        const result = statementParser.parse();
        console.log('Parsed result:', JSON.stringify(result, null, 2));
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Parsing error:', error.message);
            console.error('Error stack:', error.stack);
        } else {
            console.error('Unknown error occurred:', error);
        }
    }
    console.log('---');
}

// Test cases
testParse('action testAction()');
testParse('if (condition) { action testAction() }');
testParse('prompt TestPrompt { action testAction() }');
testParse('tool TestTool { metadata { "description": "Test tool", parameters: [], returnType: "void" } implementation "test" }');
testParse('action testAction(param1, param2)');
testParse('if (x > 5) { action doSomething() } else { action doSomethingElse() }');
testParse('prompt ComplexPrompt { input { field1: string, field2: number } action process() output { result: string } }');

console.log('All tests completed.');
