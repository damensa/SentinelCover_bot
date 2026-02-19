const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function inspectRadioButtons() {
    const pdfBytes = fs.readFileSync('ELEC1_AcroForm.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = [
        'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0].sTipus[0].RB_TipusActuacio[0]',
        'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0].sRequisits[0].RB_Requisits[0]'
    ];

    fields.forEach(name => {
        try {
            const field = form.getRadioGroup(name);
            console.log(`Field: ${name}`);
            console.log(`  Options:`, field.getOptions());
        } catch (e) {
            console.error(`Error inspecting ${name}:`, e.message);
        }
    });
}

inspectRadioButtons().catch(console.error);
