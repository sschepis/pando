import { activateExtension, deactivateExtension } from './extension/index';

export function activate(context: any) {
    activateExtension(context);
}

export function deactivate() {
    deactivateExtension();
}
