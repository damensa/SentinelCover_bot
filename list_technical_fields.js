const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function listAllFields() {
    const pdfBytes = fs.readFileSync('ELEC1_AcroForm.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('--- TECHNICAL FIELDS SEARCH ---');
    fields.forEach(f => {
        const name = f.getName();
        // Filtering for technical or observations keywords based on screenshot structure
        if (
            name.includes('Potencia') ||
            name.includes('Tensio') ||
            name.includes('Circuits') ||
            name.includes('Aillament') ||
            name.includes('Terra') ||
            name.includes('IGA') ||
            name.includes('CGP') ||
            name.includes('IGM') ||
            name.includes('LGA') ||
            name.includes('Comptadors') ||
            name.includes('Observacions') ||
            name.includes('s9[0].NomCognomsInstalador')
        ) {
            console.log(`Field: ${name} | Type: ${f.constructor.name}`);
        }
    });
}

listAllFields().catch(console.error);
