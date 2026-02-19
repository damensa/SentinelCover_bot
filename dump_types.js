
const { PDFDocument, PDFName, PDFArray } = require('pdf-lib');
const fs = require('fs');

async function dumpXFA(filename) {
    console.log('Dumping XFA Types for:', filename);
    const pdfBytes = fs.readFileSync(filename);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const catalog = pdfDoc.catalog;
    const acroForm = catalog.lookup(PDFName.of('AcroForm'));
    const xfa = acroForm.lookup(PDFName.of('XFA'));

    if (xfa instanceof PDFArray) {
        console.log('XFA Array size:', xfa.size());
        for (let i = 0; i < xfa.size(); i += 2) {
            const nameNode = xfa.lookup(i);
            const ref = xfa.get(i + 1);
            console.log(`Part ${i / 2}: Type=${nameNode.constructor.name}, Name=${nameNode.asString()}, Ref=${ref}`);
        }
    } else {
        console.log('XFA is not an array');
    }
}
dumpXFA(process.argv[2]);
