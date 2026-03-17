const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function extractTextFromDocx(filePath) {
    try {
        const zip = new AdmZip(filePath);
        const xmlBuffer = zip.readFile('word/document.xml');
        if (!xmlBuffer) {
            console.log('Could not find word/document.xml inside the DOCX');
            return;
        }
        
        const xmlString = xmlBuffer.toString('utf8');
        // VERY basic regex to just strip ALL XML tags so we can see the raw text of the document
        // We are looking for the content to understand what fields this technical memory requires
        let plainText = xmlString.replace(/<[^>]+>/g, ' ');
        // Clean up multiple spaces
        plainText = plainText.replace(/\s+/g, ' ');
        
        console.log("--- DOCX CONTENT EXTRACT ---");
        console.log(plainText.substring(0, 3000)); // Print first 3000 chars to get an idea
        
        // Let's also try to find any form fields specifically if they exist (usually w:fldChar or similar)
        // Or perhaps the user just used underlines _________ or custom notation.
        const underlines = plainText.match(/_{3,}/g);
        console.log(`\nFound ${underlines ? underlines.length : 0} underline blocks (potential empty fields)`);
        
    } catch (e) {
        console.error('Error reading DOCX:', e);
    }
}

const targetPath = 'C:/Users/dave_/Sentinel cover/Templates/Catalunya/MemoriaTecnicaELEC3.docx';
if (fs.existsSync(targetPath)) {
    extractTextFromDocx(targetPath);
} else {
    console.log('File not found at:', targetPath);
}
