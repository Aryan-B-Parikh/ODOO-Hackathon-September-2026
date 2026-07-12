import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const frontendFiles = walk('./frontend/src');
const backendFiles = walk('./backend/src');

function fixShared(content) {
  return content
    .replace(/@shared\/enums\/role\.enum/g, '@shared/enums')
    .replace(/@shared\/schemas\/auth\.schema/g, '@shared/schemas')
    .replace(/@shared\/dto\/auth\.dto/g, '@shared/dto')
    .replace(/@shared\/types\/auth\.types/g, '@shared/types');
}

function fixBackendExtensions(content) {
  // Matches: import ... from './something' or '../something'
  // Excludes if it already ends with .js
  return content.replace(/(import\s+[^'"]+\s+from\s+['"]\.\/.*?)(?<!\.js)['"]/g, "$1.js'")
                .replace(/(import\s+[^'"]+\s+from\s+['"]\.\.\/.*?)(?<!\.js)['"]/g, "$1.js'");
}

frontendFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = fixShared(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
  }
});

backendFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = fixShared(content);
  newContent = fixBackendExtensions(newContent);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
  }
});

console.log('Fixed imports!');
