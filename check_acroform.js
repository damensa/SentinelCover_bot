
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function checkFields() {
    const pdfBytes = fs.readFileSync('ELEC1CertificatInstalElectricaBT.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log('Number of fields found by pdf-lib:', fields.length);
    fields.forEach(f => {
        console.log('Field:', f.getName());
    });
}
checkFields();
