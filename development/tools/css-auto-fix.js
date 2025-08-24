#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function balanceBraces(css) {
  const toRemove = new Set();
  let depth = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      if (depth === 0) {
        // stray closing brace, remove it
        toRemove.add(i);
      } else {
        depth--;
      }
    }
  }
  let result = '';
  for (let i = 0; i < css.length; i++) {
    if (!toRemove.has(i)) result += css[i];
  }
  if (depth > 0) {
    result += '}'.repeat(depth);
  }
  return result;
}

function removeDuplicateCustomProps(css) {
  // Keep first occurrence of each --var: value; pair; remove duplicates later in file
  const seen = new Set();
  const lines = css.split(/\r?\n/);
  const out = [];
  const propRegex = /(^|\s)(--[a-zA-Z0-9\-]+)\s*:\s*([^;]+);/;
  for (const line of lines) {
    const m = line.match(propRegex);
    if (m) {
      const key = `${m[2]}:${m[3].trim()}`;
      if (seen.has(key)) {
        // drop duplicate exact var:value
        continue;
      }
      seen.add(key);
    }
    out.push(line);
  }
  // Remove empty :root blocks that may result
  let joined = out.join('\n');
  joined = joined.replace(/:root\s*\{\s*\}/g, '');
  return joined;
}

function removeBlock(css, startIdx) {
  // startIdx points at the '{' starting the block
  let depth = 0;
  let i = startIdx;
  for (; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return css.slice(0, startIdxSelectorBegin(css, startIdx)) + css.slice(i);
}

function startIdxSelectorBegin(css, braceIdx) {
  // find start of selector preceding the brace
  let i = braceIdx - 1;
  while (i >= 0 && css[i] !== '}') i--;
  return i + 1; // position after last '}' or 0
}

function cleanMalformedAndDuplicateSelectors(css) {
  // Scan and drop duplicate selectors within same block context and drop malformed (empty) selectors
  let out = '';
  const seenStack = [new Set()];
  let i = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '{') {
      // Decide if this is an at-rule block or selector block based on preceding text
      const selectorStart = startIdxSelectorBegin(css, i);
      const selector = css.slice(selectorStart, i).trim();
      const isAtRule = /@\w+/.test(selector);
      if (isAtRule) {
        // Always keep at-rule blocks; push new context and copy char
        out += css.slice(out.length, i + 1);
        seenStack.push(new Set());
        i++;
        continue;
      } else {
        // Normalize selector whitespace
        const normSelector = selector.replace(/\s+/g, ' ').trim();
        const currentSeen = seenStack[seenStack.length - 1];
        const malformed = normSelector.length === 0 || /[{}]/.test(normSelector);
        if (malformed || currentSeen.has(normSelector)) {
          // Remove entire block including nested
          const before = out.length;
          // ensure we include selector part up to selectorStart
          if (before < selectorStart) out += css.slice(before, selectorStart);
          // skip block
          let depth = 0; let j = i;
          for (; j < css.length; j++) {
            if (css[j] === '{') depth++;
            else if (css[j] === '}') { depth--; if (depth === 0) { j++; break; } }
          }
          i = j;
          continue;
        } else {
          currentSeen.add(normSelector);
          out += css.slice(out.length, i + 1);
          seenStack.push(new Set());
          i++;
          continue;
        }
      }
    } else if (ch === '}') {
      out += css[i];
      seenStack.pop();
      i++;
      continue;
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}

function hoistTopLevelVarsAndStripInvalidTopLevel(css) {
  const lines = css.split(/\r?\n/);
  const out = [];
  const rootVars = [];
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // update depth roughly using counts on the line
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    const currentDepth = depth; // depth before processing this line

    const trimmed = line.trim();
    if (currentDepth === 0) {
      if (/^--[a-zA-Z0-9\-]+\s*:\s*[^;]+;\s*$/.test(trimmed)) {
        rootVars.push(trimmed);
        // skip writing this line; will hoist to :root later
      } else if (trimmed === '' || trimmed.startsWith('@') || trimmed.includes('{') || trimmed.includes('}')) {
        out.push(line);
      } else if (trimmed.includes(':')) {
        // Top-level property outside any selector: drop
        continue;
      } else {
        // stray token/selector without block: drop
        continue;
      }
    } else {
      out.push(line);
    }

    depth += opens - closes;
    if (depth < 0) depth = 0; // guard
  }

  let result = out.join('\n');
  if (rootVars.length > 0) {
    const rootBlock = `:root{\n  ${rootVars.join('\n  ')}\n}\n`;
    result = rootBlock + result;
  }
  return result;
}

function run(filePath) {
  const full = path.resolve(filePath);
  const css = fs.readFileSync(full, 'utf8');
  let fixed = css;
  fixed = removeDuplicateCustomProps(fixed);
  fixed = balanceBraces(fixed);
  fixed = hoistTopLevelVarsAndStripInvalidTopLevel(fixed);
  fixed = cleanMalformedAndDuplicateSelectors(fixed);
  fs.writeFileSync(full, fixed, 'utf8');
  console.log(`✅ Fixed CSS: ${filePath}`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node tools/css-auto-fix.js <css-file> [<css-file> ...]');
    process.exit(1);
  }
  for (const f of args) run(f);
}

if (require.main === module) main();
