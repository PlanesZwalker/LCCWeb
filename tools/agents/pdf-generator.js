#!/usr/bin/env node

const BaseAgent = require('./base-agent');
const fileBridge = require('../file-bridge');
const { execSync } = require('child_process');
const path = require('path');

class PDFGenerator extends BaseAgent {
  constructor() {
    super('pdf-generator');
    this.generatedPDFs = [];
  }

  analyzeInstruction(instruction) {
    const keywords = {
      gdd: ['gdd', 'game design document', 'documentation'],
      all: ['all', 'complete', 'everything'],
      specific: ['specific', 'particular', 'certain'],
      highQuality: ['high quality', 'high-quality', 'quality', 'best'],
      custom: ['custom', 'customize', 'options'],
      batch: ['batch', 'multiple', 'several']
    };

    const analysis = {
      needsGDD: false,
      needsAllPages: false,
      needsSpecificPages: false,
      needsHighQuality: false,
      needsCustomOptions: false,
      needsBatchGeneration: false,
      priority: 'medium'
    };

    const lowerInstruction = instruction.toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerInstruction.includes(word))) {
        if (category === 'gdd') {
          analysis.needsGDD = true;
        } else {
          analysis[`needs${category.charAt(0).toUpperCase() + category.slice(1)}`] = true;
        }
      }
    }

    // Déterminer la priorité
    if (analysis.needsGDD) analysis.priority = 'high';
    if (analysis.needsHighQuality) analysis.priority = 'high';

    return analysis;
  }

  async generatePDF(url, filename, options = {}) {
    this.log(`📄 Génération PDF de: ${url}`, 'info');
    
    try {
      // Créer le dossier pdfs s'il n'existe pas
      const pdfsDir = 'tools/pdfs';
      if (!fileBridge.fileExists(pdfsDir)) {
        try {
          execSync(`mkdir ${pdfsDir}`, { encoding: 'utf8' });
        } catch (error) {
          // Le dossier existe peut-être déjà
          this.log(`Dossier ${pdfsDir} déjà existant ou erreur: ${error.message}`, 'warning');
        }
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const pdfPath = `${pdfsDir}/${filename}-${timestamp}.pdf`;
      
      // Options par défaut pour une haute qualité
      const defaultOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; margin-left: 20px; color: #666;">Letters Cascade Challenge</div>',
        footerTemplate: '<div style="font-size: 10px; margin-left: 20px; color: #666;">Page <span class="pageNumber"></span> sur <span class="totalPages"></span></div>',
        preferCSSPageSize: true,
        waitForSelector: null,
        delay: 3000
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Utiliser Puppeteer pour générer le PDF
      const puppeteerScript = `
        const puppeteer = require('puppeteer');
        
        (async () => {
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          
          const page = await browser.newPage();
          
          // Attendre que la page se charge complètement
          await page.goto('${url}', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
          });
          
          ${finalOptions.waitForSelector ? `await page.waitForSelector('${finalOptions.waitForSelector}');` : ''}
          await new Promise(resolve => setTimeout(resolve, ${finalOptions.delay}));
          
          // Appliquer des styles pour l'impression si nécessaire
          await page.addStyleTag({
            content: \`
              @media print {
                body { margin: 0; }
                .glass-panel, .glass-card { 
                  background: white !important;
                  box-shadow: none !important;
                  border: 1px solid #ddd !important;
                }
                * { 
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
              }
            \`
          });
          
          // Générer le PDF
          await page.pdf({
            path: '${pdfPath}',
            format: '${finalOptions.format}',
            printBackground: ${finalOptions.printBackground},
            margin: ${JSON.stringify(finalOptions.margin)},
            displayHeaderFooter: ${finalOptions.displayHeaderFooter},
            headerTemplate: '${finalOptions.headerTemplate}',
            footerTemplate: '${finalOptions.footerTemplate}',
            preferCSSPageSize: ${finalOptions.preferCSSPageSize}
          });
          
          await browser.close();
          console.log('PDF generated: ${pdfPath}');
        })();
      `;

      // Écrire le script temporaire
      const scriptPath = 'tools/temp-pdf-generator.js';
      fileBridge.writeFile(scriptPath, puppeteerScript);

      // Exécuter le script
      execSync(`node ${scriptPath}`, { 
        encoding: 'utf8', 
        cwd: process.cwd(),
        timeout: 120000 // 2 minutes
      });

      // Nettoyer le script temporaire
      if (fileBridge.fileExists(scriptPath)) {
        fileBridge.deleteFile(scriptPath);
      }

      this.generatedPDFs.push({
        url,
        path: pdfPath,
        filename: filename,
        timestamp: new Date().toISOString(),
        options: finalOptions
      });

      this.log(`✅ PDF généré avec succès: ${pdfPath}`, 'success');
      return pdfPath;
    } catch (error) {
      this.log(`❌ Erreur lors de la génération PDF: ${error.message}`, 'error');
      return null;
    }
  }

  async generateGDD() {
    this.log('📋 Génération PDF du Game Design Document...', 'info');
    
    const gddUrl = 'http://localhost:8000/public/legacy-root/GDD.html';
    
    const pdfPath = await this.generatePDF(gddUrl, 'GDD-Letters-Cascade-Challenge', {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 10px; margin-left: 20px; color: #666;">Letters Cascade Challenge - Game Design Document</div>',
      footerTemplate: '<div style="font-size: 10px; margin-left: 20px; color: #666;">Page <span class="pageNumber"></span> sur <span class="totalPages"></span></div>',
      delay: 5000 // Attendre 5 secondes pour le chargement complet
    });

    return pdfPath;
  }

  async generateAllPages() {
    this.log('📄 Génération PDF de toutes les pages...', 'info');
    
    const pages = await this.getPages();
    const pdfs = [];
    
    for (const page of pages) {
      this.log(`📄 Génération PDF de: ${page.name}`, 'info');
      
      const pdfPath = await this.generatePDF(page.url, `page-${page.name}`, {
        format: 'A4',
        printBackground: true,
        delay: 3000
      });
      
      if (pdfPath) {
        pdfs.push({
          page: page.name,
          path: pdfPath,
          url: page.url
        });
      }
    }

    return pdfs;
  }

  async generateHighQualityPDF(url, filename) {
    this.log('🎨 Génération PDF haute qualité...', 'info');
    
    const pdfPath = await this.generatePDF(url, filename, {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      displayHeaderFooter: false, // Pas de header/footer pour une meilleure qualité
      delay: 5000
    });

    return pdfPath;
  }

  generatePDFReport() {
    let report = `\n📄 Rapport de génération PDF pour ${this.agentName}:\n`;
    
    if (this.generatedPDFs.length === 0) {
      report += 'Aucun PDF généré\n';
      return report;
    }

    report += `\n📊 Total de PDFs générés: ${this.generatedPDFs.length}\n`;
    
    this.generatedPDFs.forEach((pdf, index) => {
      report += `\n${index + 1}. ${pdf.filename}\n`;
      report += `   📁 Chemin: ${pdf.path}\n`;
      report += `   🌐 URL: ${pdf.url}\n`;
      report += `   ⏰ Timestamp: ${pdf.timestamp}\n`;
    });

    return report;
  }

  async run(instruction) {
    this.log(`📄 Instruction reçue: ${instruction}`);
    
    const analysis = this.analyzeInstruction(instruction);
    this.log(`📊 Analyse: ${JSON.stringify(analysis, null, 2)}`);

    // Installer Puppeteer si nécessaire
    try {
      execSync('npm list puppeteer', { encoding: 'utf8' });
    } catch (error) {
      this.log('📦 Installation de Puppeteer...', 'info');
      execSync('npm install --save-dev puppeteer', { encoding: 'utf8' });
    }

    // Générer les PDFs selon l'analyse
    if (analysis.needsGDD) {
      const gddPDF = await this.generateGDD();
      if (gddPDF) {
        this.generatedPDFs.push({
          url: 'http://localhost:8000/public/legacy-root/GDD.html',
          path: gddPDF,
          filename: 'GDD-Letters-Cascade-Challenge',
          type: 'GDD'
        });
      }
    }

    if (analysis.needsAllPages) {
      const allPDFs = await this.generateAllPages();
      this.generatedPDFs.push(...allPDFs);
    }

    if (analysis.needsHighQuality) {
      const pages = await this.getPages();
      for (const page of pages.slice(0, 3)) { // Limiter à 3 pages pour la haute qualité
        const hqPDF = await this.generateHighQualityPDF(page.url, `hq-${page.name}`);
        if (hqPDF) {
          this.generatedPDFs.push({
            url: page.url,
            path: hqPDF,
            filename: `hq-${page.name}`,
            type: 'high-quality'
          });
        }
      }
    }

    // Générer le rapport
    const report = this.generatePDFReport();
    this.log(report, 'info');

    // Sauvegarder le rapport
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `tools/logs/pdf-report-${timestamp}.json`;
    
    const fullReport = {
      timestamp: new Date().toISOString(),
      instruction,
      analysis,
      generatedPDFs: this.generatedPDFs,
      summary: {
        total: this.generatedPDFs.length,
        gdd: this.generatedPDFs.filter(p => p.type === 'GDD').length,
        pages: this.generatedPDFs.filter(p => p.type !== 'GDD').length,
        highQuality: this.generatedPDFs.filter(p => p.type === 'high-quality').length
      }
    };

    fileBridge.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
    this.log(`📄 Rapport sauvegardé: ${reportPath}`, 'success');

    this.log(`✅ ${this.generatedPDFs.length} PDF(s) généré(s) avec succès`, 'success');
  }
}

// Exécution de l'agent
const args = process.argv.slice(2);
const instruction = args.join(' ');

if (!instruction) {
  console.error('❌ Instruction requise');
  process.exit(1);
}

const agent = new PDFGenerator();
agent.run(instruction);
