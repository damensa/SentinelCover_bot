
const { PDFDocument, PDFName, PDFArray } = require('pdf-lib');
const fs = require('fs');

async function dumpXFA() {
    const pdfBytes = fs.readFileSync('ELEC1CertificatInstalElectricaBT.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const catalog = pdfDoc.catalog;
    const acroForm = catalog.lookup(PDFName.of('AcroForm'));
    const xfa = acroForm.lookup(PDFName.of('XFA'));

    if (xfa instanceof PDFArray) {
        console.log('XFA Array size:', xfa.size());
        for (let i = 0; i < xfa.size(); i += 2) {
            const name = xfa.lookup(i).asString();
            const ref = xfa.get(i + 1);
            const stream = pdfDoc.context.lookup(ref);
            const safeName = name.replace(/[<>:"/\\|?*]/g, '_');
            console.log(`Part ${i / 2}: Name=${name}, SafeName=${safeName}, Ref=${ref}, Length=${stream.contents.length}`);
            fs.writeFileSync(`xfa_part_${i / 2}_${safeName}.bin`, stream.contents);
        }
    } else {
        console.log('XFA is not an array');
    }
}
dumpXFA();
