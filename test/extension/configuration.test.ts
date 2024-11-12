import * as vscode from 'vscode';
import { loadConfiguration } from '@extension/configuration';
import { loadCustomConfigs } from '@ai/config/utils';
import { providers } from '@ai/providers';
import base from '@ai/config/base';
import softwareDeveloper from '@ai/config/software-developer';
import { Config, Provider } from '@ai/types';

jest.mock('vscode');
jest.mock('@ai/config/utils');
jest.mock('@ai/providers');
jest.mock('@ai/config/base');
jest.mock('@ai/config/software-developer');

describe('Configuration', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should load configuration with default provider', () => {
        const mockConfig = {
            get: jest.fn().mockReturnValue('openai')
        };

        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

        const mockProvider: Provider = {
            name: 'openai',
            url: 'https://api.openai.com',
            path: '/v1/chat/completions',
            headers: {},
            client: {} as any,
            requestObject: {
                getMessage: jest.fn(),
                getOptions: jest.fn()
            },
            responseFormat: {
                getContent: jest.fn()
            },
            toolFormat: {
                formatTools: jest.fn()
            }
        };

        (providers as any).openai = mockProvider;

        const mockBaseConfig = {
            tools: [],
            prompts: []
        };

        const mockSoftwareDeveloperConfig = {
            tools: [],
            prompts: []
        };

        (base as jest.Mock).mockReturnValue(mockBaseConfig);
        (softwareDeveloper as jest.Mock).mockReturnValue(mockSoftwareDeveloperConfig);

        const mockLoadedConfig = {
            provider: mockProvider,
            tools: [],
            prompts: []
        };

        (loadCustomConfigs as jest.Mock).mockReturnValue(mockLoadedConfig);

        const result = loadConfiguration();

        expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('pando');
        expect(mockConfig.get).toHaveBeenCalledWith('defaultProvider');
        expect(base).toHaveBeenCalledWith(mockProvider);
        expect(softwareDeveloper).toHaveBeenCalledWith(mockProvider);
        expect(loadCustomConfigs).toHaveBeenCalledWith([mockBaseConfig, mockSoftwareDeveloperConfig]);
        expect(result).toEqual(mockLoadedConfig);
    });

    it('should throw an error if default provider is not found', () => {
        const mockConfig = {
            get: jest.fn().mockReturnValue('nonexistentProvider')
        };

        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

        expect(() => loadConfiguration()).toThrow('Default provider "nonexistentProvider" not found');
    });
});
