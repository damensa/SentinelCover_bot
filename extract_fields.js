
const fs = require('fs');
const content = fs.readFileSync('xfa_raw_template.xml', 'utf8');

const regex = /<field\s+[^>]*name="([^"]+)"/g;
let match;
const fields = new Set();
while ((match = regex.exec(content)) !== null) {
    fields.add(match[1]);
}

console.log('Fields found in template:', Array.from(fields).sort().join(', '));
