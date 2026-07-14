const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf-8');
const match = code.match(/en: \{[\s\S]*?\}/);
if (match) {
  console.log(match[0]);
}
