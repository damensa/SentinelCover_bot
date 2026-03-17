const fs = require('fs');
const content = fs.readFileSync('dumped_part_2_template.bin', 'utf8');

const regex = /<field\s+[^>]*name="([^"]+)"/g;
let match;
const fields = new Set();
while ((match = regex.exec(content)) !== null) {
    fields.add(match[1]);
}
console.log(`Found ${fields.size} unique fields:`);
console.log(Array.from(fields).join('\n'));
