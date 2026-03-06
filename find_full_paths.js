const fs = require('fs');
const { PDFDocument, PDFName, PDFDict, PDFString, PDFArray } = require('pdf-lib');

async function findFullPath() {
    const pdfBytes = fs.readFileSync('DeclaracioResponsableInstallacio.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(field => {
        const name = field.getName();
        if (name.includes('TXT_NomVia') || name.includes('TXT_Nom') || name.includes('CUPS')) {
            console.log(`Field: ${name}`);
        }
    });
}

findFullPath();
