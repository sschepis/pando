import { AIError } from '../../errors';
import { Config, RunnerOptions, Provider } from '../types';

export async function executeFunction(runner: any, name: string, args: any = {}): Promise<any> {
    runner.logger.debug(`[executeFunction] Executing function: ${name}`, { args });

    const functions = {
        ...runner.config.tools.reduce((acc: any, tool: any) => {
            acc[tool.function.name] = tool.function.script;
            return acc;
        }, {}),
        ...runner.options.functions
    };

    const func = functions[name];
    if (func) {
        try {
            const result = await func(args, runner);
            runner.logger.debug(`[executeFunction] Function executed successfully: ${name}`, { result });
            return result;
        } catch (error: unknown) {
            runner.logger.error(`Error executing function: ${name}`, { 
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new AIError(
                `Error executing function "${name}": ${error instanceof Error ? error.message : String(error)}`,
                error
            );
        }
    }

    runner.logger.error(`Function not found: ${name}`);
    throw new AIError(`Function "${name}" not found`);
}
