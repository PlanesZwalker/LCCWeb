#!/usr/bin/env node

// LLaVA Agent for image analysis and description
// Usage: node tools/agent-run.js llava-agent "describe all screenshots"

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const instruction = process.argv[3] || 'Analyze and describe all available images and screenshots';

console.log(`[LLaVA] ${instruction}`);

// Find all image files in the project
function findImageFiles(dir = '.') {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
  const imageFiles = [];
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (imageExtensions.includes(ext)) {
            imageFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  scanDirectory(dir);
  return imageFiles;
}

// Analyze images with LLaVA (if available)
async function analyzeImagesWithLLaVA(imageFiles) {
  const results = [];
  
  for (const imageFile of imageFiles) {
    console.log(`[LLaVA] Analyzing: ${imageFile}`);
    
    try {
      // Try to use LLaVA via Ollama if available
      const result = await analyzeWithOllamaLLaVA(imageFile);
      results.push({
        file: imageFile,
        description: result,
        method: 'LLaVA via Ollama'
      });
    } catch (error) {
      // Fallback to basic file analysis
      const basicAnalysis = analyzeImageBasic(imageFile);
      results.push({
        file: imageFile,
        description: basicAnalysis,
        method: 'Basic analysis'
      });
    }
  }
  
  return results;
}

// Try to use LLaVA via Ollama
async function analyzeWithOllamaLLaVA(imageFile) {
  return new Promise((resolve, reject) => {
    // Check if image exists and is readable
    if (!fs.existsSync(imageFile)) {
      reject(new Error(`Image file not found: ${imageFile}`));
      return;
    }
    
    // Try to use LLaVA model via Ollama
    const ollama = spawn('ollama', ['run', 'llava', '--image', imageFile, 'Describe this image in detail']);
    
    let output = '';
    let errorOutput = '';
    
    ollama.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ollama.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    ollama.on('close', (code) => {
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        reject(new Error(`LLaVA analysis failed: ${errorOutput || 'Unknown error'}`));
      }
    });
    
    ollama.on('error', (error) => {
      reject(new Error(`Failed to run LLaVA: ${error.message}`));
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      ollama.kill();
      reject(new Error('LLaVA analysis timed out'));
    }, 30000);
  });
}

// Basic image analysis without LLaVA
function analyzeImageBasic(imageFile) {
  const stats = fs.statSync(imageFile);
  const ext = path.extname(imageFile).toLowerCase();
  const name = path.basename(imageFile);
  const relativePath = path.relative('.', imageFile);
  
  let analysis = `Image: ${name}\n`;
  analysis += `Path: ${relativePath}\n`;
  analysis += `Size: ${(stats.size / 1024).toFixed(2)} KB\n`;
  analysis += `Format: ${ext.toUpperCase()}\n`;
  analysis += `Modified: ${stats.mtime.toISOString()}\n`;
  
  // Add context based on file location
  if (relativePath.includes('screenshots')) {
    analysis += `Context: Screenshot capture\n`;
  } else if (relativePath.includes('public')) {
    analysis += `Context: Public website asset\n`;
  } else if (relativePath.includes('tools')) {
    analysis += `Context: Tool or documentation image\n`;
  }
  
  // Add content hints based on filename
  const lowerName = name.toLowerCase();
  if (lowerName.includes('game') || lowerName.includes('play')) {
    analysis += `Content hint: Game-related screenshot\n`;
  } else if (lowerName.includes('ui') || lowerName.includes('interface')) {
    analysis += `Content hint: User interface\n`;
  } else if (lowerName.includes('error') || lowerName.includes('bug')) {
    analysis += `Content hint: Error or issue screenshot\n`;
  }
  
  return analysis;
}

// Main execution
async function main() {
  try {
    console.log('[LLaVA] Scanning for image files...');
    const imageFiles = findImageFiles();
    
    if (imageFiles.length === 0) {
      console.log('[LLaVA] No image files found in the project');
      return;
    }
    
    console.log(`[LLaVA] Found ${imageFiles.length} image files`);
    
    const results = await analyzeImagesWithLLaVA(imageFiles);
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join('.agents', 'logs', 'llava-analysis', `llava-report-${timestamp}.json`);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    const report = {
      timestamp: new Date().toISOString(),
      instruction,
      totalImages: imageFiles.length,
      results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`[LLaVA] Analysis complete. Report saved to: ${reportPath}`);
    console.log(`[LLaVA] Analyzed ${results.length} images`);
    
    // Print summary
    results.forEach((result, index) => {
      console.log(`\n[LLaVA] Image ${index + 1}: ${path.basename(result.file)}`);
      console.log(`Method: ${result.method}`);
      console.log(`Description: ${result.description.substring(0, 200)}${result.description.length > 200 ? '...' : ''}`);
    });
    
  } catch (error) {
    console.error(`[LLaVA] Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { findImageFiles, analyzeImagesWithLLaVA, analyzeImageBasic };
