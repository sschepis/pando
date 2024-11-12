import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

// Use require to load escomplex
const escomplex = require('escomplex');

export interface FunctionAnalysis {
  averageLength: number;
  complexityAnalysis: {
    averageComplexity: number;
    functionComplexities: { name: string; complexity: number }[];
  };
}

export function analyzeFunctionLength(code: string): FunctionAnalysis {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  const functions: t.Function[] = [];

  traverse(ast, {
    Function(path) {
      functions.push(path.node);
    },
  });

  if (functions.length === 0) {
    return {
      averageLength: 0,
      complexityAnalysis: {
        averageComplexity: 0,
        functionComplexities: [],
      },
    };
  }

  const totalLength = functions.reduce((sum, func) => {
    const funcLines = code.slice(func.start!, func.end!).split('\n');
    return sum + funcLines.length;
  }, 0);

  const averageLength = Math.round(totalLength / functions.length);

  const complexityAnalysis = analyzeFunctionComplexity(code, functions);

  return {
    averageLength,
    complexityAnalysis,
  };
}

function analyzeFunctionComplexity(
  code: string,
  functions: t.Function[]
): {
  averageComplexity: number;
  functionComplexities: { name: string; complexity: number }[];
} {
  const functionComplexities = functions.map((func) => {
    const functionCode = code.slice(func.start!, func.end!);
    const complexity = escomplex.analyse(functionCode).cyclomatic;
    const name = getFunctionName(func);
    return { name, complexity };
  });

  const totalComplexity = functionComplexities.reduce(
    (sum, func) => sum + func.complexity,
    0
  );
  const averageComplexity =
    functionComplexities.length > 0
      ? totalComplexity / functionComplexities.length
      : 0;

  return {
    averageComplexity,
    functionComplexities,
  };
}

function getFunctionName(func: t.Function): string {
  if (t.isFunctionDeclaration(func) && func.id) {
    return func.id.name;
  } else if (
    t.isFunctionExpression(func) ||
    t.isArrowFunctionExpression(func)
  ) {
    const parent = (func as any).parent;
    if (parent && t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
      return parent.id.name;
    } else if (parent && t.isObjectProperty(parent) && t.isIdentifier(parent.key)) {
      return parent.key.name;
    }
  }
  return 'anonymous';
}

export function generateFunctionReport(analysis: FunctionAnalysis): string {
  let report = 'Function Analysis Report\n';
  report += '=========================\n\n';
  report += `Average Function Length: ${analysis.averageLength} lines\n`;
  report += `Average Cyclomatic Complexity: ${analysis.complexityAnalysis.averageComplexity.toFixed(2)}\n\n`;

  report += 'Function Complexities:\n';
  analysis.complexityAnalysis.functionComplexities.forEach((func) => {
    report += `  - ${func.name}: ${func.complexity}\n`;
  });

  report += '\nInterpretation:\n';
  if (analysis.averageLength > 20) {
    report += '- Functions are longer than recommended. Consider breaking them down into smaller, more manageable functions.\n';
  }
  if (analysis.complexityAnalysis.averageComplexity > 10) {
    report += '- The average cyclomatic complexity is high. Consider simplifying complex functions to improve maintainability.\n';
  }

  return report;
}
