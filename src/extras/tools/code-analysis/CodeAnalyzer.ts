import { ESLint } from 'eslint';
import { analyzeCodeQuality, CodeQualityMetrics, generateReport } from './analyzeCodeQuality';
import { ComplexityMetrics } from './calculateComplexity';
import { interpretMaintainabilityIndex } from './calculateMaintainabilityIndex';
import { DuplicationResult, interpretDuplication } from './detectCodeDuplication';
import { CommentAnalysis } from './analyzeCommentDensity';
import { FunctionAnalysis } from './analyzeFunctionLength';

export interface SecurityIssue {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  location: string;
}

export class CodeAnalyzer {
  private eslint: ESLint;

  constructor() {
    this.eslint = new ESLint();
  }

  async analyzeCode(code: string): Promise<{
    codeQualityMetrics: CodeQualityMetrics;
    securityIssues: SecurityIssue[];
    codeSmells: string[];
  }> {
    const codeQualityMetrics = await analyzeCodeQuality(code);
    const securityIssues = await this.analyzeSecurityIssues(code);
    const codeSmells = this.detectCodeSmells(codeQualityMetrics);

    return {
      codeQualityMetrics,
      securityIssues,
      codeSmells
    };
  }

  private async analyzeSecurityIssues(code: string): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const eslintResults = await this.eslint.lintText(code);

    for (const result of eslintResults) {
      for (const message of result.messages) {
        if (message.severity === 2) { // Error
          issues.push({
            severity: 'HIGH',
            description: message.message,
            location: `Line ${message.line}, Column ${message.column}`
          });
        } else if (message.severity === 1) { // Warning
          issues.push({
            severity: 'MEDIUM',
            description: message.message,
            location: `Line ${message.line}, Column ${message.column}`
          });
        }
      }
    }

    return issues;
  }

  private detectCodeSmells(metrics: CodeQualityMetrics): string[] {
    const codeSmells: string[] = [];
    const { complexity, maintainabilityIndex, codeDuplication, commentAnalysis, functionAnalysis } = metrics;

    if (complexity.cyclomaticComplexity > 10) {
      codeSmells.push(`High Cyclomatic Complexity: ${complexity.cyclomaticComplexity}. Consider refactoring complex functions.`);
    }

    if (complexity.cognitiveComplexity > 15) {
      codeSmells.push(`High Cognitive Complexity: ${complexity.cognitiveComplexity}. Try to simplify complex logic and reduce nesting levels.`);
    }

    if (maintainabilityIndex < 65) {
      codeSmells.push(`Low Maintainability Index: ${maintainabilityIndex.toFixed(2)}. ${interpretMaintainabilityIndex(maintainabilityIndex)}`);
    }

    if (codeDuplication.percentage > 10) {
      codeSmells.push(`High Code Duplication: ${codeDuplication.percentage.toFixed(2)}% of code is duplicated. ${interpretDuplication(codeDuplication)}`);
    }

    if (commentAnalysis.density < 10) {
      codeSmells.push(`Low Comment Density: ${commentAnalysis.density.toFixed(2)}% of code is comments. Consider adding more documentation.`);
    } else if (commentAnalysis.density > 30) {
      codeSmells.push(`High Comment Density: ${commentAnalysis.density.toFixed(2)}% of code is comments. This might indicate overly complex code.`);
    }

    if (functionAnalysis.averageLength > 20) {
      codeSmells.push(`Long Functions: Average function length is ${functionAnalysis.averageLength.toFixed(2)} lines. Consider breaking down long functions.`);
    }

    return codeSmells;
  }

  generateComprehensiveReport(analysisResult: {
    codeQualityMetrics: CodeQualityMetrics;
    securityIssues: SecurityIssue[];
    codeSmells: string[];
  }): string {
    let report = generateReport(analysisResult.codeQualityMetrics);

    report += '\nSecurity Issues:\n';
    report += '================\n';
    if (analysisResult.securityIssues.length === 0) {
      report += 'No security issues detected.\n';
    } else {
      analysisResult.securityIssues.forEach((issue, index) => {
        report += `${index + 1}. Severity: ${issue.severity}\n`;
        report += `   Description: ${issue.description}\n`;
        report += `   Location: ${issue.location}\n\n`;
      });
    }

    report += '\nCode Smells:\n';
    report += '============\n';
    if (analysisResult.codeSmells.length === 0) {
      report += 'No code smells detected.\n';
    } else {
      analysisResult.codeSmells.forEach((smell, index) => {
        report += `${index + 1}. ${smell}\n`;
      });
    }

    return report;
  }
}
