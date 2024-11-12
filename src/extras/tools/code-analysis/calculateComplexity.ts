import * as ts from 'typescript';

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  functionComplexities: Array<{
    name: string;
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
  }>;
}

export function calculateComplexity(code: string): ComplexityMetrics {
  const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);

  let cyclomaticComplexity = 1;
  let cognitiveComplexity = 0;
  const functionComplexities: ComplexityMetrics['functionComplexities'] = [];

  function visit(node: ts.Node, nestingLevel: number = 0) {
    switch (node.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.ConditionalExpression:
        cyclomaticComplexity++;
        cognitiveComplexity += 1 + nestingLevel;
        break;
      case ts.SyntaxKind.CaseClause:
        if ((node as ts.CaseClause).expression) {
          cyclomaticComplexity++;
          cognitiveComplexity++;
        }
        break;
      case ts.SyntaxKind.CatchClause:
        cognitiveComplexity++;
        break;
      case ts.SyntaxKind.BinaryExpression:
        const binaryExpr = node as ts.BinaryExpression;
        if (binaryExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
            binaryExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
          cyclomaticComplexity++;
          cognitiveComplexity++;
        }
        break;
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.ArrowFunction:
        const funcName = ts.isFunctionDeclaration(node) && node.name ? node.name.text : 'anonymous';
        const funcMetrics = calculateFunctionComplexity(node);
        functionComplexities.push({
          name: funcName,
          ...funcMetrics,
        });
        break;
    }

    ts.forEachChild(node, child => visit(child, nestingLevel + 1));
  }

  function calculateFunctionComplexity(node: ts.Node): { cyclomaticComplexity: number; cognitiveComplexity: number } {
    let funcCyclomaticComplexity = 1;
    let funcCognitiveComplexity = 0;

    function visitFunction(funcNode: ts.Node, funcNestingLevel: number = 0) {
      switch (funcNode.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.ConditionalExpression:
          funcCyclomaticComplexity++;
          funcCognitiveComplexity += 1 + funcNestingLevel;
          break;
        case ts.SyntaxKind.CaseClause:
          if ((funcNode as ts.CaseClause).expression) {
            funcCyclomaticComplexity++;
            funcCognitiveComplexity++;
          }
          break;
        case ts.SyntaxKind.CatchClause:
          funcCognitiveComplexity++;
          break;
        case ts.SyntaxKind.BinaryExpression:
          const binaryExpr = funcNode as ts.BinaryExpression;
          if (binaryExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
              binaryExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
            funcCyclomaticComplexity++;
            funcCognitiveComplexity++;
          }
          break;
      }

      ts.forEachChild(funcNode, child => visitFunction(child, funcNestingLevel + 1));
    }

    visitFunction(node);
    return { cyclomaticComplexity: funcCyclomaticComplexity, cognitiveComplexity: funcCognitiveComplexity };
  }

  visit(sourceFile);

  return {
    cyclomaticComplexity,
    cognitiveComplexity,
    functionComplexities,
  };
}

export function generateComplexityReport(metrics: ComplexityMetrics): string {
  let report = 'Complexity Analysis Report\n';
  report += '===========================\n\n';
  report += `Overall Cyclomatic Complexity: ${metrics.cyclomaticComplexity}\n`;
  report += `Overall Cognitive Complexity: ${metrics.cognitiveComplexity}\n\n`;

  report += 'Function Complexities:\n';
  metrics.functionComplexities.forEach(func => {
    report += `  ${func.name}:\n`;
    report += `    Cyclomatic Complexity: ${func.cyclomaticComplexity}\n`;
    report += `    Cognitive Complexity: ${func.cognitiveComplexity}\n`;
  });

  report += '\nInterpretation:\n';
  if (metrics.cyclomaticComplexity > 10) {
    report += '- The overall cyclomatic complexity is high. Consider refactoring complex functions into smaller, more manageable pieces.\n';
  }
  if (metrics.cognitiveComplexity > 15) {
    report += '- The overall cognitive complexity is high. Try to simplify complex logic and reduce nesting levels to improve code readability.\n';
  }

  return report;
}
