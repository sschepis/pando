// LOCKED: TRUE
// All content in this file is locked and cannot be edited.

import { parentPort } from 'worker_threads';
import * as acorn from 'acorn';
import * as astring from 'astring';
import { Program } from 'estree';
import { ESLint } from 'eslint';
import { walk } from 'estree-walker';

interface WorkerMessage {
  task: string;
  data: string;
  options?: any;
}

interface WorkerResult {
  success: boolean;
  result?: any;
  error?: string;
}

if (parentPort) {
  parentPort.on('message', async (message: WorkerMessage) => {
    let result: WorkerResult | undefined;

    try {
      switch (message.task) {
        case 'parse':
          result = {
            success: true,
            result: acorn.parse(message.data, { 
              ecmaVersion: message.options?.ecmaVersion || 2020, 
              sourceType: message.options?.sourceType || 'module' 
            }) as Program
          };
          break;
        case 'walk':
            const identifiers: string[] = [];
            walk(acorn.parse(message.data, { ecmaVersion: 2020, sourceType: 'module' }) as Program, {
              enter(node: any) {
                if (node.type === 'Identifier') {
                  identifiers.push(node.name);
                }
              }
            });
            result = { success: true, result: identifiers };
        case 'generate':
          result = { 
            success: true, 
            result: astring.generate(JSON.parse(message.data) as Program, message.options) 
          };
          break;
        case 'format':
            result = { 
                success: true, 
                result: astring.generate(acorn.parse(message.data, { ecmaVersion: 2020, sourceType: 'module' }) as Program, message.options) 
            };
          break;
        case 'lint':
            const linter = new ESLint();
            const messages = await linter.lintText(message.data, message.options);
            result = { success: true, result: messages };
          break;
        case 'transform':
            const transformation = new Function('ast', message.data) as (ast: Program) => Program;
            const transformedAst = transformation(acorn.parse(message.options?.ast, { ecmaVersion: 2020, sourceType: 'module' }) as Program);
            result = { success: true, result: astring.generate(transformedAst) };
          break;
        default:
          throw new Error(`Unknown task: ${message.task}`);
      }
    } catch (error) {
      result = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }

    if(parentPort) parentPort.postMessage(result);
  });
} else {
  throw new Error('Worker.ts: parentPort is null. This script must be run as a worker.');
}

function handleError(error: Error): void {
  if (parentPort) {
    parentPort.postMessage({ success: false, error: error.message });
  } else {
    console.error('Worker.ts: Unhandled error occurred, but parentPort is null.', error);
  }
}

process.on('uncaughtException', handleError);
process.on('unhandledRejection', (reason) => {
  handleError(reason instanceof Error ? reason : new Error(String(reason)));
});