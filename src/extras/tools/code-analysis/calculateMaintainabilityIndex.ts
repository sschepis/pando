import { calculateComplexity, ComplexityMetrics } from './calculateComplexity';
import { analyzeCommentDensity, CommentAnalysis } from './analyzeCommentDensity';

export function calculateMaintainabilityIndex(code: string): number {
    const loc = code.split('\n').length;
    const complexityMetrics: ComplexityMetrics = calculateComplexity(code);
    const commentAnalysis: CommentAnalysis = analyzeCommentDensity(code);

    // Use cyclomatic complexity for the calculation
    const complexity = complexityMetrics.cyclomaticComplexity;
    const commentDensity = commentAnalysis.density;

    // Simplified maintainability index calculation
    const maintainabilityIndex = Math.max(0, (171 - 5.2 * Math.log(complexity) - 0.23 * loc - 16.2 * Math.log(loc) + 50 * Math.sin(Math.sqrt(2.4 * commentDensity))) * 100 / 171);

    return Math.min(100, maintainabilityIndex);
}

export function interpretMaintainabilityIndex(index: number): string {
    if (index > 85) {
        return "The code has high maintainability.";
    } else if (index > 65) {
        return "The code has moderate maintainability.";
    } else {
        return "The code has low maintainability and might be difficult to maintain.";
    }
}
