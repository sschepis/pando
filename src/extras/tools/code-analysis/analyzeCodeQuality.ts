import { ESLint } from 'eslint';
import { calculateComplexity, ComplexityMetrics, generateComplexityReport } from './calculateComplexity';
import { calculateMaintainabilityIndex, interpretMaintainabilityIndex } from './calculateMaintainabilityIndex';
import { detectCodeDuplication, DuplicationResult, generateDuplicationReport } from './detectCodeDuplication';
import { analyzeCommentDensity, CommentAnalysis, generateCommentReport } from './analyzeCommentDensity';
import { analyzeFunctionLength, FunctionAnalysis, generateFunctionReport } from './analyzeFunctionLength';

export interface CodeQualityMetrics {
  complexity: ComplexityMetrics;
  maintainabilityIndex: number;
  codeDuplication: DuplicationResult;
  commentAnalysis: CommentAnalysis;
  functionAnalysis: FunctionAnalysis;
  eslintIssues: ESLint.LintResult[];
}

export async function analyzeCodeQuality(code: string): Promise<CodeQualityMetrics> {
  const eslint = new ESLint();
  const eslintResults = await eslint.lintText(code);
  
  // Use calculateComplexity for complexity metrics
  const complexityMetrics = calculateComplexity(code);

  return {
    complexity: complexityMetrics,
    maintainabilityIndex: calculateMaintainabilityIndex(code),
    codeDuplication: detectCodeDuplication(code),
    commentAnalysis: analyzeCommentDensity(code),
    functionAnalysis: analyzeFunctionLength(code),
    eslintIssues: eslintResults
  };
}

// Function to generate a comprehensive report
export function generateReport(metrics: CodeQualityMetrics): string {
  let report = 'Code Quality Analysis Report\n';
  report += '==============================\n\n';

  report += generateComplexityReport(metrics.complexity);
  report += '\n';
  report += `Maintainability Index: ${metrics.maintainabilityIndex}\n`;
  report += interpretMaintainabilityIndex(metrics.maintainabilityIndex) + '\n\n';

  report += generateDuplicationReport(metrics.codeDuplication);
  report += '\n';

  report += generateCommentReport(metrics.commentAnalysis);
  report += '\n';
  report += generateFunctionReport(metrics.functionAnalysis);

  report += '\nESLint Issues (including SonarJS):\n';
  metrics.eslintIssues.forEach(result => {
    result.messages.forEach(msg => {
      report += `  - ${msg.message} (${msg.ruleId}) at line ${msg.line}\n`;
    });
  });

  return report;
}
