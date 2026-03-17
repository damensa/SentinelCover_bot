const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function listButtons() {
    const templatePath = 'ELEC1_AcroForm.pdf';
    console.log(`Analyzing: ${templatePath}`);
    const pdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(field => {
        const name = field.getName();
        const type = field.constructor.name;
        if (type.includes('Radio') || type.includes('CheckBox') || type.includes('Button')) {
            console.log(`Field: ${name} | Type: ${type}`);
            if (type.includes('Radio')) {
                console.log(`  Options: ${field.getOptions()}`);
            }
        }
    });
}

listButtons();
