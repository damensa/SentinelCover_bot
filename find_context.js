const fs = require('fs');

const xml = fs.readFileSync('dr_template.xml', 'utf8').replace(/\r?\n|\r/g, ' ');

// Find the context around TXT_NomVia
const index = xml.indexOf('name="TXT_NomVia"');
const context = xml.substring(index - 500, index + 500);
console.log(context);
