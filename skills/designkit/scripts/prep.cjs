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
  console.log('Usage: node prep.cjs --source <component-dir> [--output <catalog-dir>] [--tokens <css-file>] [--repo <project-root>]');
  console.log('');
  console.log('Scans component HTML files and builds a block catalog.');
  console.log('Each .html file in source dir becomes a block.');
  console.log('Files with YAML frontmatter (in HTML comments) are parsed for metadata.');
  console.log('If --repo is provided, inspects the project codebase and writes repo-context.json.');
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

// Detect project stack from package.json
function inspectRepo(repoRoot) {
  const context = {
    frameworks: [],
    styling: [],
    componentLibraries: [],
    tokens: [],
    tokenSources: []
  };

  // Read package.json(s) - check root and common monorepo locations
  const pkgPaths = [path.join(repoRoot, 'package.json')];
  ['apps', 'packages'].forEach(dir => {
    const d = path.join(repoRoot, dir);
    if (fs.existsSync(d)) {
      fs.readdirSync(d, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .forEach(e => pkgPaths.push(path.join(d, e.name, 'package.json')));
    }
  });

  const allDeps = {};
  pkgPaths.forEach(p => {
    try {
      const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
      Object.assign(allDeps, pkg.dependencies || {}, pkg.devDependencies || {});
    } catch {}
  });

  // Detect frameworks
  if (allDeps.next) context.frameworks.push('Next.js');
  if (allDeps.react) context.frameworks.push('React');
  if (allDeps.vue) context.frameworks.push('Vue');
  if (allDeps.svelte || allDeps['@sveltejs/kit']) context.frameworks.push('Svelte');
  if (allDeps.astro) context.frameworks.push('Astro');

  // Detect styling
  if (allDeps.tailwindcss || allDeps['@tailwindcss/postcss']) context.styling.push('Tailwind CSS');
  if (allDeps['styled-components']) context.styling.push('styled-components');
  if (allDeps['@emotion/react'] || allDeps['@emotion/styled']) context.styling.push('Emotion');
  if (allDeps['framer-motion']) context.styling.push('Framer Motion');

  // Detect component libraries
  if (allDeps['lucide-react'] || allDeps['lucide-vue-next'] || allDeps.lucide) context.componentLibraries.push('Lucide');
  if (allDeps['@radix-ui/react-dialog'] || allDeps['@radix-ui/react-slot']) context.componentLibraries.push('Radix UI');
  if (allDeps['class-variance-authority']) context.componentLibraries.push('cva');
  if (allDeps['@headlessui/react']) context.componentLibraries.push('Headless UI');
  if (allDeps['@mui/material']) context.componentLibraries.push('MUI');
  if (allDeps['@chakra-ui/react']) context.componentLibraries.push('Chakra UI');
  if (allDeps.antd) context.componentLibraries.push('Ant Design');

  // Scan for CSS token files
  const tokenPatterns = [
    'tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs',
    'src/styles/tokens.css', 'src/styles/variables.css', 'src/styles/globals.css',
    'styles/tokens.css', 'styles/variables.css', 'styles/globals.css',
    'src/app/globals.css', 'app/globals.css'
  ];
  tokenPatterns.forEach(p => {
    const full = path.join(repoRoot, p);
    if (fs.existsSync(full)) {
      context.tokenSources.push(p);
      // Extract CSS custom properties
      try {
        const css = fs.readFileSync(full, 'utf8');
        const varMatches = css.match(/--[\w-]+\s*:/g);
        if (varMatches) {
          varMatches.forEach(m => {
            const token = m.replace(/\s*:$/, '');
            if (!context.tokens.includes(token)) context.tokens.push(token);
          });
        }
      } catch {}
    }
  });

  return context;
}

// Write repo-context.json if --repo was provided
const repoRoot = getArg('repo');
if (repoRoot) {
  const repoContext = inspectRepo(path.resolve(repoRoot));
  fs.writeFileSync(path.join(outputDir, 'repo-context.json'), JSON.stringify(repoContext, null, 2));
  console.log('  Frameworks:', repoContext.frameworks.join(', ') || 'none detected');
  console.log('  Styling:', repoContext.styling.join(', ') || 'none detected');
  console.log('  Components:', repoContext.componentLibraries.join(', ') || 'none detected');
  console.log('  Token sources:', repoContext.tokenSources.length);
  console.log('  CSS tokens:', repoContext.tokens.length);
}
