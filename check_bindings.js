
const fs = require('fs');
const content = fs.readFileSync('xfa_raw_template.xml', 'utf8');

// Find NomCognoms field and its bind child
const regex = /<field\s+[^>]*name="NomCognoms"[^>]*>([\s\S]*?)<\/field>/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log('--- Field NomCognoms content ---');
    console.log(match[1].substring(0, 500)); // Print some content
    const bindMatch = /<bind\s+[^>]*ref="([^"]+)"/g.exec(match[1]);
    if (bindMatch) {
        console.log('Bind ref: ' + bindMatch[1]);
    } else {
        console.log('No specific bind ref found');
    }
}
