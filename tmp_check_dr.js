const fs = require('fs');
const pdfLib = require('pdf-lib');

async function run() {
    const pdfPath = process.argv[2];
    if (!pdfPath) { console.log('No file provided'); return; }
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Found ${fields.length} form fields`);
    fields.forEach((f) => {
        console.log(`Field Name: "${f.getName()}", Type: ${f.constructor.name}`);
    });
}
run().catch(err => console.error(err));
