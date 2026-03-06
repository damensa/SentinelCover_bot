const fs = require('fs');

const xml = fs.readFileSync('dr_template.xml', 'utf8').replace(/\r?\n|\r/g, ' ');

// Find all matches of name="..." or ref="..."
const regex = / (name|ref)="([^"]+)"/g;
let match;
while ((match = regex.exec(xml)) !== null) {
    console.log(`${match[1]}: ${match[2]}`);
}
