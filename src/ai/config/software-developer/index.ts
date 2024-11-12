import { Config, Provider } from '../../types';
import { prompts } from './prompts';
import { tools } from './tools';


export default function (provider: Provider): Config {
    return {
        provider,
        tools,
        prompts,
    };
}
