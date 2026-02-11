#!/usr/bin/env node

const fs = require('fs');

// Lê data.json gerado pelo fetch.js
const raw = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const opportunities = raw.opportunities || [];

console.log(`Generating index.html with ${opportunities.length} opportunities`);

// Lê template index.html (deve conter %OPPORTUNITIES_JSON%)
let html = fs.readFileSync('index.html', 'utf8');

// Substitui placeholder
html = html.replace('%OPPORTUNITIES_JSON%', JSON.stringify(opportunities));

// Escreve arquivo final
fs.writeFileSync('index.html', html);
console.log('✅ index.html generated');
