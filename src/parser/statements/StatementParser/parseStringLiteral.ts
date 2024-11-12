export function parseStringLiteral(this: any, errorMessage: string): string {
    const token = this.consume('STRING', errorMessage);
    return token.value;
}
