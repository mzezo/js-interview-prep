const fs = require('fs');
const path = require('path');

const q4Path = path.join(__dirname, 'app/src/data/questions-4.ts');
let q4Code = fs.readFileSync(q4Path, 'utf8');

// I know I added 20 debugging questions in questions-4.ts using IDs 169 to 188.
// Since questions-6 uses up to 184, and questions-3 uses 189-208, 
// let's assign the newly added debugging questions completely fresh IDs: 209 to 228.
let counter = 209;
q4Code = q4Code.replace(/id: (169|17[0-9]|18[0-8]),/g, () => `id: ${counter++},`);

fs.writeFileSync(q4Path, q4Code);
console.log('Fixed IDs in questions-4.ts. New range: 209 to 228.');
