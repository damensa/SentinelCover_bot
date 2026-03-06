const fs = require('fs');

const xml = fs.readFileSync('dr_template.xml', 'utf8');

// Regex to find fields and their bindings
// <field name="([^"]+)"[^>]*>.*?<bind ref="([^"]+)"
const fieldMatch = /<field\s+[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/field>/g;
const bindMatch = /<bind\s+[^>]*ref="([^"]+)"/;

let match;
const results = [];

while ((match = fieldMatch.exec(xml)) !== null) {
    const fieldName = match[1];
    const content = match[2];
    const bind = bindMatch.exec(content);
    if (bind) {
        results.push({ field: fieldName, bind: bind[1] });
    } else {
        results.push({ field: fieldName, bind: 'No binding found' });
    }
}

console.log(JSON.stringify(results, null, 2));
