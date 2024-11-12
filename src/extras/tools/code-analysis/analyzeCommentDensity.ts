import * as doctrine from 'doctrine';

export interface CommentAnalysis {
  density: number;
  quality: number;
  jsdocCount: number;
}

export function analyzeCommentDensity(code: string): CommentAnalysis {
    const lines = code.split('\n');
    let commentLines = 0;
    let inBlockComment = false;
    let jsdocComments: string[] = [];
    let currentJSDoc = '';

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (inBlockComment) {
            commentLines++;
            currentJSDoc += line + '\n';
            if (trimmedLine.includes('*/')) {
                inBlockComment = false;
                jsdocComments.push(currentJSDoc);
                currentJSDoc = '';
            }
        } else if (trimmedLine.startsWith('//')) {
            commentLines++;
        } else if (trimmedLine.startsWith('/*')) {
            commentLines++;
            inBlockComment = true;
            if (trimmedLine.startsWith('/**')) {
                currentJSDoc = line + '\n';
            }
        } else if (trimmedLine.includes('//')) {
            commentLines++;
        }
    }

    const density = (commentLines / lines.length) * 100;
    const quality = analyzeCommentQuality(jsdocComments);

    return {
        density,
        quality,
        jsdocCount: jsdocComments.length
    };
}

function analyzeCommentQuality(jsdocComments: string[]): number {
    let totalQuality = 0;

    for (const comment of jsdocComments) {
        const parsedComment = doctrine.parse(comment, { unwrap: true });
        
        // Calculate quality based on the presence of different JSDoc tags
        let commentQuality = 0;
        if (parsedComment.description) commentQuality += 1;
        if (parsedComment.tags.some((tag: doctrine.Tag) => tag.title === 'param')) commentQuality += 2;
        if (parsedComment.tags.some((tag: doctrine.Tag) => tag.title === 'returns')) commentQuality += 2;
        if (parsedComment.tags.some((tag: doctrine.Tag) => tag.title === 'example')) commentQuality += 3;
        
        totalQuality += commentQuality;
    }

    // Normalize quality score to a 0-100 scale
    return jsdocComments.length > 0 ? (totalQuality / (jsdocComments.length * 8)) * 100 : 0;
}

export function generateCommentReport(analysis: CommentAnalysis): string {
    let report = 'Comment Analysis Report\n';
    report += '========================\n\n';
    report += `Comment Density: ${analysis.density.toFixed(2)}%\n`;
    report += `Comment Quality: ${analysis.quality.toFixed(2)}/100\n`;
    report += `JSDoc Comment Count: ${analysis.jsdocCount}\n`;
    
    report += '\nInterpretation:\n';
    if (analysis.density < 10) {
        report += '- The code might be under-documented. Consider adding more comments.\n';
    } else if (analysis.density > 40) {
        report += '- The code might be over-commented. Consider removing redundant comments.\n';
    }
    
    if (analysis.quality < 50) {
        report += '- The quality of JSDoc comments could be improved. Ensure all functions have descriptions, parameter, and return value documentation.\n';
    } else if (analysis.quality > 80) {
        report += '- The JSDoc comments are of high quality. Good job!\n';
    }

    return report;
}
