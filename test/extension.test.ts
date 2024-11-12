import * as vscode from 'vscode';

describe('Extension Test Suite', () => {
    beforeAll(() => {
        // Setup before all tests
    });

    it('should be present', () => {
        expect(vscode.window).toBeDefined();
    });

    it('should activate', async () => {
        const ext = vscode.extensions.getExtension('pando');
        expect(ext).toBeDefined();
        if (ext) {
            await ext.activate();
            expect(ext.isActive).toBeTruthy();
        }
    });
});
