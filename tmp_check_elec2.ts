const fs = require('fs');
const pdfLib = require('pdf-lib');

async function run() {
    const pdfBytes = fs.readFileSync('C:/Users/dave_/Sentinel cover/Templates/Catalunya/EsquemaUnifilarELEC2 (1).pdf');
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Found ${fields.length} form fields`);
    fields.forEach(f => {
        console.log(`Field Name: ${f.getName()}, Type: ${f.constructor.name}`);
    });

}

run().catch(err => console.error(err));
