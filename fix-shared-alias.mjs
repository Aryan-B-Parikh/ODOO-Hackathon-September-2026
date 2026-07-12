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
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.test.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = [...walk('./frontend/src'), ...walk('./backend/src'), ...walk('./backend/tests')];

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/@shared\//g, 'shared/');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
  }
});
console.log('Fixed @shared to shared');
