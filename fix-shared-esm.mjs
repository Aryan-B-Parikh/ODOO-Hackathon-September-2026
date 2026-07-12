import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
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

const sharedFiles = walk('./shared/src');

function fixSharedExtensions(content) {
  // Replace: import ... from './something' -> './something.js'
  // Replace: export ... from './something' -> './something.js'
  return content.replace(/((?:import|export)\s+[^'"]+\s+from\s+['"]\.\/.*?)(?<!\.js)['"]/g, "$1.js'")
                .replace(/((?:import|export)\s+[^'"]+\s+from\s+['"]\.\.\/.*?)(?<!\.js)['"]/g, "$1.js'")
                // also fix bare export * from './something'
                .replace(/(export\s*\*\s*from\s+['"]\.\/.*?)(?<!\.js)['"]/g, "$1.js'")
                .replace(/(export\s*\*\s*from\s+['"]\.\.\/.*?)(?<!\.js)['"]/g, "$1.js'");
}

sharedFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = fixSharedExtensions(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
  }
});
console.log('Fixed shared extensions');
