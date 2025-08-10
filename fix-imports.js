// fix-imports.js
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(process.argv[2] || '.'); // folder to process, default current folder
const extensions = ['.js', '.ts', '.tsx'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match imports from "src/..."
  // It handles both import and require
  const regex = /((import\s.+?\sfrom\s+['"])src\/|require\(['"])src\//g;

  if (!regex.test(content)) return;

  // Replace 'src/' with '../'
  content = content.replace(regex, (match) => {
    return match.replace('src/', '../');
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in: ${filePath}`);
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (extensions.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  });
}

walkDir(targetDir);
console.log('Done.');
