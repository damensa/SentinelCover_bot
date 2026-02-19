
const fs = require('fs');
const content = fs.readFileSync('xfa_raw_template.xml', 'utf8');

const fieldName = 'TXT_NomVia';
const regex = new RegExp('<field\\s+[^>]*name="' + fieldName + '"[\\s\\S]*?<\\/field>', 'g');
let match;
while ((match = regex.exec(content)) !== null) {
    console.log('--- Field ' + fieldName + ' ---');
    console.log(match[0]);
}
