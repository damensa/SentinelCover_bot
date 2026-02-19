const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function listAllFields() {
    const pdfBytes = fs.readFileSync('ELEC1_AcroForm.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(f => {
        console.log(f.getName());
    });
}

listAllFields().catch(console.error);
