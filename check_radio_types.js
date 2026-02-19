const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function checkFieldTypes() {
    const pdfBytes = fs.readFileSync('ELEC1_AcroForm.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fieldsToInspect = [
        'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0].sTipus[0].RB_TipusActuacio[0]',
        'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0].sTipus[0].RB_TipusActuacio[0]1',
        'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0].sRequisits[0].RB_Requisits[0]'
    ];

    fieldsToInspect.forEach(name => {
        try {
            const field = form.getField(name);
            console.log(`Field: ${name} | Type: ${field.constructor.name}`);
        } catch (e) {
            console.error(`Error: ${name} not found`);
        }
    });
}

checkFieldTypes().catch(console.error);
