#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DependencyAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.fileMap = new Map(); // filepath -> file info
    this.dependencyGraph = new Map(); // filepath -> Set of dependencies
    this.reverseDependencyGraph = new Map(); // filepath -> Set of files that depend on this
    this.externalDependencies = new Set();
    this.potentiallyUnused = new Set();
    
    // Known entry points that should never be marked as unused
    this.entryPoints = new Set([
      'App.js',
      'index.js',
      'app.config.js',
      'metro.config.js',
      'babel.config.js'
    ]);
    
    // Config file patterns that should be excluded
    this.configFilePatterns = [
      /\.config\.(js|ts|jsx|tsx)$/,
      /\.setup\.(js|ts|jsx|tsx)$/,
      /\.test\.(js|ts|jsx|tsx)$/,
      /\.spec\.(js|ts|jsx|tsx)$/,
      /\/__tests__\//,
      /\/tests?\//,
      /\.stories\.(js|ts|jsx|tsx)$/
    ];
    
    // Asset patterns
    this.assetPatterns = [
      /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
      /\.(mp3|mp4|wav|ogg)$/i,
      /\.(ttf|otf|woff|woff2)$/i,
      /\.(json)$/i
    ];
  }

  // Scan all relevant files in the project
  scanFiles() {
    console.log('🔍 Scanning project files...');
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(this.rootDir, fullPath);
        
        // Skip node_modules, build directories, and other common excludes
        if (this.shouldSkipDirectory(item, relativePath)) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(item).toLowerCase())) {
          // Normalize path separators to forward slashes for consistency
          const normalizedRelativePath = relativePath.replace(/\\/g, '/');
          
          this.fileMap.set(normalizedRelativePath, {
            fullPath,
            relativePath: normalizedRelativePath,
            size: stat.size,
            isEntryPoint: this.entryPoints.has(item) || this.entryPoints.has(normalizedRelativePath),
            isConfigFile: this.configFilePatterns.some(pattern => pattern.test(normalizedRelativePath))
          });
        }
      }
    };
    
    scanDirectory(this.rootDir);
    console.log(`📁 Found ${this.fileMap.size} JavaScript/TypeScript files`);
  }

  shouldSkipDirectory(dirname, relativePath) {
    const skipDirs = [
      'node_modules',
      '.git',
      'build',
      'dist',
      'coverage',
      '.expo',
      'android/build',
      'ios/build',
      'ios/Pods',
      '.gradle',
      '__pycache__'
    ];
    
    return skipDirs.includes(dirname) || 
           skipDirs.some(skip => relativePath.includes(skip + path.sep));
  }

  // Extract all import statements from a file
  extractImports(fileContent, filePath) {
    const imports = new Set();
    
    // Remove comments and strings to avoid false positives
    const cleanContent = this.removeCommentsAndStrings(fileContent);
    
    // Handle multiline imports by normalizing whitespace first
    const normalizedContent = cleanContent.replace(/\s+/g, ' ');
    
    // ES6 imports - updated to handle multiline and various formats
    const importPatterns = [
      // import React from 'react' or import { useState } from 'react'
      /import\s+(?:\w+(?:\s*,\s*\{[^}]*\})?|\{[^}]*\}|\*\s+as\s+\w+)?\s+from\s+['"`]([^'"`]+)['"`]/g,
      // import React, { useState } from 'react'
      /import\s+\w+\s*,\s*\{[^}]*\}\s+from\s+['"`]([^'"`]+)['"`]/g,
      // import('dynamic-import')
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // require('module')
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];
    
    // Also check the original content for imports to catch missed patterns
    const contentToCheck = [cleanContent, normalizedContent, fileContent];
    
    for (const content of contentToCheck) {
      for (const pattern of importPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1];
          if (importPath) {
            imports.add(importPath.trim());
          }
        }
        // Reset regex state
        pattern.lastIndex = 0;
      }
    }
    
    // Special React Native patterns
    this.extractReactNativeSpecialImports(cleanContent, imports);
    
    // Asset imports (images, etc.)
    this.extractAssetImports(cleanContent, imports);
    
    return imports;
  }

  removeCommentsAndStrings(content) {
    // Remove single-line comments but preserve the line
    content = content.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Don't remove import/require strings - we need them
    // Only remove template literals and regular strings that aren't in import statements
    
    // First, extract all import/require lines
    const importLines = [];
    const lines = content.split('\n');
    
    const cleanedLines = lines.map(line => {
      // Keep import and require lines as-is
      if (/^\s*(import|const\s+.*=\s*require)\s/.test(line)) {
        return line;
      }
      
      // For other lines, remove strings and template literals
      line = line.replace(/`(?:[^`\\]|\\.)*`/g, '""');
      line = line.replace(/'(?:[^'\\]|\\.)*'/g, '""');
      line = line.replace(/"(?:[^"\\]|\\.)*"/g, '""');
      
      return line;
    });
    
    return cleanedLines.join('\n');
  }

  extractReactNativeSpecialImports(content, imports) {
    // Platform-specific imports
    const platformPatterns = [
      /Platform\.select\s*\(\s*\{[^}]*ios\s*:\s*(?:require\s*\(\s*)?['"`]([^'"`]+)['"`]/g,
      /Platform\.select\s*\(\s*\{[^}]*android\s*:\s*(?:require\s*\(\s*)?['"`]([^'"`]+)['"`]/g,
      /Platform\.OS\s*===\s*['"`]ios['"`]\s*\?\s*(?:require\s*\(\s*)?['"`]([^'"`]+)['"`]/g,
      /Platform\.OS\s*===\s*['"`]android['"`]\s*\?\s*(?:require\s*\(\s*)?['"`]([^'"`]+)['"`]/g
    ];
    
    for (const pattern of platformPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          imports.add(match[1].trim());
        }
      }
    }
  }

  extractAssetImports(content, imports) {
    // Asset imports like require('./image.png')
    const assetPattern = /require\s*\(\s*['"`]([^'"`]*\.(png|jpg|jpeg|gif|svg|ico|webp|mp3|mp4|wav|ogg|ttf|otf|woff|woff2|json))['"`]\s*\)/gi;
    
    let match;
    while ((match = assetPattern.exec(content)) !== null) {
      if (match[1]) {
        imports.add(match[1].trim());
      }
    }
  }

  // Resolve import path to actual file path
  resolveImportPath(importPath, currentFilePath) {
    // Skip external packages
    if (!importPath.startsWith('.')) {
      this.externalDependencies.add(importPath);
      return null;
    }
    
    const currentDir = path.dirname(currentFilePath);
    let resolvedPath = path.resolve(this.rootDir, currentDir, importPath);
    
    // Make relative to root and normalize path separators
    resolvedPath = path.relative(this.rootDir, resolvedPath).replace(/\\/g, '/');
    
    // Try different extensions if no extension provided
    if (!path.extname(resolvedPath)) {
      const extensions = ['.js', '.jsx', '.ts', '.tsx'];
      const indexExtensions = ['/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
      
      // First try direct file with extensions
      for (const ext of extensions) {
        const testPath = resolvedPath + ext;
        if (this.fileMap.has(testPath)) {
          return testPath;
        }
      }
      
      // Then try index files
      for (const indexExt of indexExtensions) {
        const testPath = resolvedPath + indexExt;
        if (this.fileMap.has(testPath)) {
          return testPath;
        }
      }
    } else {
      // Check if the exact path exists
      if (this.fileMap.has(resolvedPath)) {
        return resolvedPath;
      }
      
      // Try without extension and with different extensions
      const basePath = resolvedPath.replace(/\.[^.]*$/, '');
      const extensions = ['.js', '.jsx', '.ts', '.tsx'];
      
      for (const ext of extensions) {
        const testPath = basePath + ext;
        if (this.fileMap.has(testPath)) {
          return testPath;
        }
      }
    }
    
    return null;
  }

  // Build the dependency graph
  buildDependencyGraph() {
    console.log('🔗 Building dependency graph...');
    
    for (const [filePath, fileInfo] of this.fileMap) {
      try {
        const content = fs.readFileSync(fileInfo.fullPath, 'utf-8');
        const imports = this.extractImports(content, filePath);
        
        const dependencies = new Set();
        
        for (const importPath of imports) {
          const resolvedPath = this.resolveImportPath(importPath, filePath);
          if (resolvedPath && resolvedPath !== filePath) {
            dependencies.add(resolvedPath);
            
            // Add to reverse dependency graph
            if (!this.reverseDependencyGraph.has(resolvedPath)) {
              this.reverseDependencyGraph.set(resolvedPath, new Set());
            }
            this.reverseDependencyGraph.get(resolvedPath).add(filePath);
          }
        }
        
        this.dependencyGraph.set(filePath, dependencies);
        
      } catch (error) {
        console.warn(`⚠️  Warning: Could not analyze ${filePath}: ${error.message}`);
        this.dependencyGraph.set(filePath, new Set());
      }
    }
    
    console.log(`📊 Built dependency graph for ${this.dependencyGraph.size} files`);
    console.log(`📦 Found ${this.externalDependencies.size} external dependencies`);
  }

  // Find potentially unused files
  findUnusedFiles() {
    console.log('🕵️  Identifying potentially unused files...');
    
    for (const [filePath, fileInfo] of this.fileMap) {
      // Skip entry points and config files
      if (fileInfo.isEntryPoint || fileInfo.isConfigFile) {
        continue;
      }
      
      // Check if this file is imported by any other file
      const importedBy = this.reverseDependencyGraph.get(filePath);
      
      if (!importedBy || importedBy.size === 0) {
        // Check if it's a potential entry point based on name patterns
        const fileName = path.basename(filePath);
        const isLikelyEntryPoint = this.isLikelyEntryPoint(fileName, filePath);
        
        if (!isLikelyEntryPoint) {
          this.potentiallyUnused.add(filePath);
        }
      }
    }
    
    console.log(`🗑️  Found ${this.potentiallyUnused.size} potentially unused files`);
  }

  isLikelyEntryPoint(fileName, filePath) {
    // Screen components are often entry points
    if (filePath.includes('/screens/') && !filePath.includes('/components/')) {
      return true;
    }
    
    // Service files might be entry points
    if (filePath.includes('/services/') && !fileName.includes('test')) {
      return true;
    }
    
    // Context providers are often entry points
    if (filePath.includes('/context/') || filePath.includes('/contexts/')) {
      return true;
    }
    
    // Hook files might be entry points
    if (filePath.includes('/hooks/')) {
      return true;
    }
    
    return false;
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      summary: {
        totalFiles: this.fileMap.size,
        totalDependencies: this.externalDependencies.size,
        potentiallyUnusedFiles: this.potentiallyUnused.size,
        analysisDate: new Date().toISOString()
      },
      unusedFiles: Array.from(this.potentiallyUnused).sort(),
      externalDependencies: Array.from(this.externalDependencies).sort(),
      dependencyStats: this.generateDependencyStats(),
      entryPoints: this.findActualEntryPoints(),
      largestFiles: this.findLargestFiles(),
      mostConnectedFiles: this.findMostConnectedFiles()
    };
    
    return report;
  }

  generateDependencyStats() {
    const stats = {
      filesWithNoDependencies: 0,
      filesWithMostDependencies: { file: '', count: 0 },
      averageDependenciesPerFile: 0
    };
    
    let totalDependencies = 0;
    
    for (const [filePath, dependencies] of this.dependencyGraph) {
      const depCount = dependencies.size;
      totalDependencies += depCount;
      
      if (depCount === 0) {
        stats.filesWithNoDependencies++;
      }
      
      if (depCount > stats.filesWithMostDependencies.count) {
        stats.filesWithMostDependencies = { file: filePath, count: depCount };
      }
    }
    
    stats.averageDependenciesPerFile = Math.round(totalDependencies / this.fileMap.size * 100) / 100;
    
    return stats;
  }

  findActualEntryPoints() {
    const entryPoints = [];
    
    for (const [filePath, fileInfo] of this.fileMap) {
      if (fileInfo.isEntryPoint) {
        entryPoints.push(filePath);
      }
    }
    
    return entryPoints.sort();
  }

  findLargestFiles() {
    const files = Array.from(this.fileMap.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10)
      .map(([path, info]) => ({
        file: path,
        size: info.size,
        sizeKB: Math.round(info.size / 1024 * 100) / 100
      }));
    
    return files;
  }

  findMostConnectedFiles() {
    const files = Array.from(this.reverseDependencyGraph.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10)
      .map(([path, importedBy]) => ({
        file: path,
        importedByCount: importedBy.size,
        importedBy: Array.from(importedBy).sort()
      }));
    
    return files;
  }

  // Main analysis function
  async analyze() {
    console.log('🚀 Starting dependency analysis...\n');
    
    this.scanFiles();
    this.buildDependencyGraph();
    this.findUnusedFiles();
    
    const report = this.generateReport();
    
    // Write detailed report to file
    const reportPath = path.join(this.rootDir, 'dependency-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary to console
    this.printSummary(report);
    
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    return report;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPENDENCY ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Total Files: ${report.summary.totalFiles}`);
    console.log(`📦 External Dependencies: ${report.summary.totalDependencies}`);
    console.log(`🗑️  Potentially Unused Files: ${report.summary.potentiallyUnusedFiles}`);
    console.log(`📈 Average Dependencies per File: ${report.dependencyStats.averageDependenciesPerFile}`);
    
    if (report.unusedFiles.length > 0) {
      console.log('\n🗑️  POTENTIALLY UNUSED FILES:');
      console.log('-'.repeat(40));
      report.unusedFiles.forEach(file => {
        const fileInfo = this.fileMap.get(file);
        const sizeKB = Math.round(fileInfo.size / 1024 * 100) / 100;
        console.log(`  • ${file} (${sizeKB} KB)`);
      });
    }
    
    if (report.mostConnectedFiles.length > 0) {
      console.log('\n🔗 MOST CONNECTED FILES:');
      console.log('-'.repeat(40));
      report.mostConnectedFiles.slice(0, 5).forEach(file => {
        console.log(`  • ${file.file} (imported by ${file.importedByCount} files)`);
      });
    }
    
    if (report.largestFiles.length > 0) {
      console.log('\n📏 LARGEST FILES:');
      console.log('-'.repeat(40));
      report.largestFiles.slice(0, 5).forEach(file => {
        console.log(`  • ${file.file} (${file.sizeKB} KB)`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Main execution
async function main() {
  const rootDir = process.argv[2] || process.cwd();
  
  console.log(`🔍 Analyzing codebase in: ${rootDir}\n`);
  
  const analyzer = new DependencyAnalyzer(rootDir);
  
  try {
    await analyzer.analyze();
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DependencyAnalyzer;