
const fs = require('fs');
const content = fs.readFileSync('xfa_raw_template.xml', 'utf8');

const fieldRegex = /<field\s+[^>]*name="([^"]+)"[\s\S]*?<\/field>/g;
let match;
while ((match = fieldRegex.exec(content)) !== null) {
    const name = match[1];
    const fieldContent = match[0];
    const bindNone = fieldContent.includes('bind match="none"');
    const bindDataRef = /<bind\s+match="dataRef"\s+ref="([^"]+)"/.exec(fieldContent);

    if (bindNone) {
        // console.log(`Field ${name}: NO BINDING`);
    } else if (bindDataRef) {
        console.log(`Field ${name}: BIND TO ${bindDataRef[1]}`);
    } else {
        console.log(`Field ${name}: DEFAULT BINDING`);
    }
}
