
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function checkFieldTypes() {
    const pdfBytes = fs.readFileSync('ELEC1_AcroForm.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(f => {
        const name = f.getName();
        // Look for the fields in the screenshot
        if (name.includes('RB_') || name.includes('CHK_')) {
            console.log(`Field: ${name}`);
            console.log(`  Type: ${f.constructor.name}`);
            if (f.constructor.name === 'PDFRadioButton') {
                console.log(`  Options:`, f.getOptions());
            }
            if (f.constructor.name === 'PDFCheckBox') {
                console.log(`  IsChecked:`, f.isChecked());
            }
        }
    });
}

checkFieldTypes().catch(console.error);
