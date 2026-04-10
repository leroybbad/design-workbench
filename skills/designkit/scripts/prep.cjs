#!/usr/bin/env node

// Prep script: scans a component library and generates a block catalog.
// Usage: node prep.cjs --source <component-dir> --output <catalog-dir> [--tokens <css-file>]

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}

const sourceDir = getArg('source');
const outputDir = getArg('output') || path.join(process.cwd(), 'catalog');
const tokensFile = getArg('tokens');

if (!sourceDir) {
  console.log('Usage: node prep.cjs --source <component-dir> [--output <catalog-dir>] [--tokens <css-file>]');
  console.log('');
  console.log('Scans component HTML files and builds a block catalog.');
  console.log('Each .html file in source dir becomes a block.');
  console.log('Files with YAML frontmatter (in HTML comments) are parsed for metadata.');
  process.exit(1);
}

// Ensure output directories exist
const blocksDir = path.join(outputDir, 'blocks');
const templatesDir = path.join(outputDir, 'templates');
fs.mkdirSync(blocksDir, { recursive: true });
fs.mkdirSync(templatesDir, { recursive: true });

// Parse frontmatter from block files
function parseFrontmatter(content) {
  const match = content.match(/^<!--\s*\n([\s\S]*?)\n-->/);
  if (!match) return {};
  const meta = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key && val) meta[key] = val;
    }
  });
  return meta;
}

// Scan source directory for .html files
function scanBlocks(dir) {
  const results = [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const meta = parseFrontmatter(content);

    const block = {
      file: file,
      name: meta.name || file.replace('.html', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: meta.category || 'Components',
      description: meta.description || '',
      slots: meta.slots || 'none',
      variants: meta.variants || ''
    };

    // Copy block file to output
    fs.copyFileSync(path.join(dir, file), path.join(blocksDir, file));

    results.push(block);
  });

  return results;
}

// Copy tokens file if provided
if (tokensFile) {
  try {
    fs.copyFileSync(tokensFile, path.join(outputDir, 'tokens.css'));
    console.log('Copied tokens:', tokensFile);
  } catch (e) {
    console.warn('Warning: could not copy tokens file:', e.message);
  }
}

// Ensure blank template exists
const blankTemplate = path.join(templatesDir, '_blank.html');
if (!fs.existsSync(blankTemplate)) {
  fs.writeFileSync(blankTemplate, '<main data-canvas>\n  <section data-section data-section-id="s1">\n    <div data-slot="content" style="min-height: 200px; padding: 24px;">\n      <!-- Start building -->\n    </div>\n  </section>\n</main>');
}

// Scan and build manifest
console.log('Scanning:', sourceDir);
const blocks = scanBlocks(sourceDir);

// Scan templates
const templates = fs.readdirSync(templatesDir)
  .filter(f => f.endsWith('.html'))
  .map(f => ({ file: f, name: f.replace('.html', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }));

// Write manifest
const manifest = { blocks, templates };
fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Catalog generated:');
console.log('  Blocks:', blocks.length);
console.log('  Templates:', templates.length);
console.log('  Output:', outputDir);
