const fs = require('fs');
const mammoth = require('mammoth');

async function extractText() {
    try {
        const filePath = 'C:/Users/dave_/Sentinel cover/Templates/Catalunya/MemoriaTecnicaELEC3.docx';
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value; // The raw text
        console.log("--- START DOCX CONTENT ---");
        console.log(text.substring(0, 3000));
        
        // Let's also search for typical blanks (e.g. ____ or DNI: )
        const blanks = text.match(/_{3,}/g);
        console.log(`\nFound ${blanks ? blanks.length : 0} underline blanks.`);
    } catch (err) {
        console.error("Error reading docx with mammoth:", err);
    }
}

extractText();
