const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function listAllFields() {
    const pdfBytes = fs.readFileSync('ELEC1_AcroForm.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const output = fields.map(f => f.getName()).join('\n');
    fs.writeFileSync('all_fields_utf8.txt', output, 'utf8');
}

listAllFields().catch(console.error);
