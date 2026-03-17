const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('C:/Users/dave_/Sentinel cover/Templates/Catalunya/DICTAMEN DE RECONEIXEMENT COMPLERT EN BLANC.docx', 'binary');
const zip = new PizZip(content);
const xml = zip.file('word/document.xml').asText();

// Extract text nodes
const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
if (matches) {
    const text = matches.map(m => m.replace(/<[^>]+>/g, '')).join('\n');
    fs.writeFileSync('C:/tmp/extracted_docx.txt', text);
    console.log('Saved to C:/tmp/extracted_docx.txt');
} else {
    console.log('No text found');
}
