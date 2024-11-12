import * as path from 'path';
import { runTests } from '@vscode/test-electron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../');

        // The path to the extension test script
        const extensionTestsPath = path.resolve(__dirname, './setup');

        // Download VS Code, unzip it and set up the test environment
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ['--disable-extensions']
        });

        // Run Jest tests
        const { stdout, stderr } = await execAsync('jest --colors', {
            cwd: extensionDevelopmentPath
        });

        console.log(stdout);
        if (stderr) console.error(stderr);

        // Check if tests failed
        if (stderr && stderr.includes('Test failed')) {
            process.exit(1);
        }
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main();
