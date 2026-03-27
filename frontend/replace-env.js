const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'https://channel-scheduling-backend.onrender.com/api';
const apiTimeout = process.env.API_TIMEOUT || '30000';

const envProdPath = path.join(__dirname, 'src/environments/environment.prod.ts');
let content = fs.readFileSync(envProdPath, 'utf8');

content = content.replace(
  /apiUrl: '.*'/,
  `apiUrl: '${apiUrl}'`
);
content = content.replace(
  /apiTimeout: \d+/,
  `apiTimeout: ${apiTimeout}`
);

fs.writeFileSync(envProdPath, content);
console.log(`✅ Environment configurado: API_URL=${apiUrl}, API_TIMEOUT=${apiTimeout}`);