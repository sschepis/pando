export interface DuplicationResult {
    percentage: number;
    duplicateLines: string[];
    totalLines: number;
}

export function detectCodeDuplication(code: string, minLineLength: number = 5): DuplicationResult {
    const lines = code.split('\n');
    const duplicateLines = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[i].trim() === lines[j].trim() && lines[i].trim().length >= minLineLength) {
                duplicateLines.add(lines[i].trim());
                break;
            }
        }
    }

    const percentage = (duplicateLines.size / lines.length) * 100;

    return {
        percentage,
        duplicateLines: Array.from(duplicateLines),
        totalLines: lines.length
    };
}

export function interpretDuplication(result: DuplicationResult): string {
    if (result.percentage > 20) {
        return `High code duplication detected (${result.percentage.toFixed(2)}%). Consider refactoring to reduce duplication.`;
    } else if (result.percentage > 10) {
        return `Moderate code duplication detected (${result.percentage.toFixed(2)}%). Some refactoring may be beneficial.`;
    } else {
        return `Low code duplication detected (${result.percentage.toFixed(2)}%). Code appears to have good reusability.`;
    }
}

export function generateDuplicationReport(result: DuplicationResult): string {
    let report = 'Code Duplication Analysis\n';
    report += '===========================\n\n';
    report += `Duplication Percentage: ${result.percentage.toFixed(2)}%\n`;
    report += `Total Lines: ${result.totalLines}\n`;
    report += `Duplicate Lines: ${result.duplicateLines.length}\n\n`;

    report += 'Interpretation:\n';
    report += interpretDuplication(result) + '\n\n';

    if (result.duplicateLines.length > 0) {
        report += 'Sample of Duplicate Lines:\n';
        result.duplicateLines.slice(0, 5).forEach(line => {
            report += `  "${line}"\n`;
        });
        if (result.duplicateLines.length > 5) {
            report += `  ... and ${result.duplicateLines.length - 5} more\n`;
        }
    }

    return report;
}
