const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf-8');
const match = code.match(/const translations = \{[\s\S]*?\};/);
if (match) {
  console.log(match[0].substring(0, 1000));
}
