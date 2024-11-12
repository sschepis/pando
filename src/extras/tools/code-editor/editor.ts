// LOCKED: TRUE
// All content in this file is locked and cannot be edited.

import { promises as fs } from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';
import * as acorn from 'acorn';
import * as estree from 'estree';
import * as astring from 'astring';
import { LRUCache } from 'lru-cache';
import { createPatch } from 'diff';

export class CodeEditor {
  private fileCache: LRUCache<string, { content: string; ast: acorn.Node }>;
  private workerPool: Worker[];

  constructor(options = { maxCacheSize: 100, cacheMaxAge: 1000 * 60 * 60, workerCount: 4 }) {
    this.fileCache = new LRUCache({
      max: options.maxCacheSize || 100
    });
    this.workerPool = this.createWorkerPool(options.workerCount || 4);
  }

  private createWorkerPool(size: number): Worker[] {
    const pool: Worker[] = [];
    for (let i = 0; i < size; i++) {
      const workerPath = process.env.NODE_ENV === 'production'
        ? path.resolve(__dirname, 'worker.js')
        : path.resolve(__dirname, '..', '..', 'dist', 'code-editor', 'worker.js');
      const worker: Worker = new Worker(workerPath);
      pool.push(worker);
    }
    return pool;
  }

  private getWorker(): Worker {
    return this.workerPool[Math.floor(Math.random() * this.workerPool.length)];
  }

  private async runWorkerTask(task: string, data: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker();
      worker.postMessage({ task, data });
      worker.once('message', resolve);
      worker.once('error', reject);
    });
  }

  async open(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
      this.fileCache.set(filePath, { content, ast });
    } catch (error: any) {
      throw new Error(`Failed to open file ${filePath}: ${error.message}`);
    }
  }

  async read(filePath: string): Promise<string | null> {
    if (!this.fileCache.has(filePath)) {
      await this.open(filePath);
    }
    const fileHit = this.fileCache.get(filePath);
    return fileHit ? fileHit.content : null;
  }

  async write(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
      this.fileCache.set(filePath, { content, ast });
    } catch (error: any) {
      throw new Error(`Failed to write to file ${filePath}: ${error.message}`);
    }
  }

  async search(pattern: string, options = { flags: 'g' }): Promise<{ filePath: string; matches: RegExpMatchArray }[]> {
    try {
      const results: { filePath: string; matches: RegExpMatchArray }[] = [];
      for (const [filePath, { content }] of this.fileCache.entries()) {
        const regex = new RegExp(pattern, options.flags || 'g');
        const matches: RegExpMatchArray | null  = content.match(regex);
        if (matches) {
          results.push({ filePath, matches });
        }
      }
      return results;
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async replace(pattern: string, replacement: string, options = { flags: 'g' }): Promise<{ filePath: string; content: string; changesApplied: boolean }[]> {
    try {
      const results: { filePath: string; content: string; changesApplied: boolean }[] = [];
      for (const [filePath, { content }] of this.fileCache.entries()) {
        const regex = new RegExp(pattern, options.flags || 'g');
        const newContent = content.replace(regex, replacement);
        if (newContent !== content) {
          await this.write(filePath, newContent);
          results.push({ filePath, content: newContent, changesApplied: true });
        }
      }
      return results;
    } catch (error: any) {
      throw new Error(`Replace operation failed: ${error.message}`);
    }
  }

  async transform(transformation: (ast: estree.Node) => estree.Node, filePath: string): Promise<void> {
    try {
      const value = this.fileCache.get(filePath);
      if(!value) {
        throw new Error(`File ${filePath} not found in cache`);
      }
      const { ast } = value;
      const transformedAst = transformation(ast as unknown as estree.Node);
      const transformedCode = astring.generate(transformedAst);
      await this.write(filePath, transformedCode);
    } catch (error: any) {
      throw new Error(`Transformation failed for file ${filePath}: ${error.message}`);
    }
  }

  async diff(filePath: string): Promise<string> {
    try {
      const originalContent = await fs.readFile(filePath, 'utf-8');
      const fileHit = this.fileCache.get(filePath);
      const currentContent = fileHit ? fileHit.content : null;
      if (!currentContent) {
        throw new Error(`File ${filePath} not found in cache`);
      }
      return this.generateDiff(originalContent, currentContent, filePath);
    } catch (error: any) {
      throw new Error(`Failed to generate diff for file ${filePath}: ${error.message}`);
    }
  }

  async listFiles(directory: string): Promise<string[]> {
    try {
      return await fs.readdir(directory);
    } catch (error: any) {
      throw new Error(`Failed to list files in directory ${directory}: ${error.message}`);
    }
  }

  private generateDiff(oldStr: string, newStr: string, filePath: string): string {
    return createPatch(filePath, oldStr, newStr);
  }

  async format(input: string): Promise<string> {
    try {
      const ast = acorn.parse(input, { ecmaVersion: 2020, sourceType: 'module' });
      return this.generateFormattedCode(ast as unknown as estree.Node);
    } catch (error: any) {
      throw new Error(`Formatting failed: ${error.message}`);
    }
  }

  private generateFormattedCode(ast: estree.Node): string {
    return astring.generate(ast, {
      indent: '  ',
      lineEnd: '\n',
      generator: {
        ...astring.baseGenerator,
      },
    });
  }

  async applyChanges(filePath: string, changes: any): Promise<{ success: boolean; message: string }> {
    try {
      const content = await this.read(filePath);
      if (content === null) {
        throw new Error(`File ${filePath} not found in cache`);
      }
      const newContent = this.applyChangesToContent(content, changes);
      await this.write(filePath, newContent);
      return { success: true, message: `Changes applied to ${filePath}` };
    } catch (error: any) {
      throw new Error(`Failed to apply changes to file ${filePath}: ${error.message}`);
    }
  }

  private applyChangesToContent(content: string, changes: any): string {
    let newContent = content;
    if (typeof changes === 'string') {
      newContent = changes;
    } else if (Array.isArray(changes)) {
      for (const change of changes) {
        if (change.type === 'replace' && typeof change.start === 'number' && typeof change.end === 'number') {
          newContent = newContent.slice(0, change.start) + change.text + newContent.slice(change.end);
        }
      }
    }
    return newContent;
  }

  async close(): Promise<void> {
    this.fileCache.clear();
    for (const worker of this.workerPool) {
      worker.terminate();
    }
  }
}