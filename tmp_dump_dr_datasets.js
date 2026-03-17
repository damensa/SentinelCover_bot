const { PDFDocument, PDFName, PDFArray } = require('pdf-lib');
const fs = require('fs');
const zlib = require('zlib');

async function dumpDatasets(pdfPath) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    const acroForm = pdfDoc.catalog.get(PDFName.of('AcroForm'));
    const acroFormDict = pdfDoc.context.lookup(acroForm);
    const xfa = acroFormDict.get(PDFName.of('XFA'));
    const xfaObj = pdfDoc.context.lookup(xfa);

    let datasetsRef = null;
    for (let i = 0; i < xfaObj.size(); i += 2) {
        const nameObj = pdfDoc.context.lookup(xfaObj.get(i));
        const name = (nameObj instanceof PDFName) ? nameObj.asName() : nameObj.toString();
        if (name.includes('datasets')) {
            datasetsRef = xfaObj.get(i + 1);
            break;
        }
    }

    if (!datasetsRef) {
        console.log("No datasets found.");
        return;
    }

    const datasetsStream = pdfDoc.context.lookup(datasetsRef);
    let contents = datasetsStream.contents;
    
    // Decompress if FlateDecode
    const filter = datasetsStream.dict.get(PDFName.of('Filter'));
    if (filter) {
        let isFlate = false;
        if (filter instanceof PDFArray) {
            for (let i = 0; i < filter.size(); i++) {
                if (filter.get(i) === PDFName.of('FlateDecode') || filter.get(i)?.toString() === '/FlateDecode') isFlate = true;
            }
        } else if (filter === PDFName.of('FlateDecode') || filter?.toString() === '/FlateDecode') {
            isFlate = true;
        }

        if (isFlate) {
            try { contents = zlib.inflateSync(contents); }
            catch (e) { contents = zlib.inflateRawSync(contents); }
        }
    }

    const xml = Buffer.from(contents).toString('utf8');
    
    // Extract tags
    const tags = new Set();
    const regex = /<([^/?>\s]+)[^>]*>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        tags.add(match[1]);
    }
    
    console.log(`Found XML tags in dataset:`);
    console.log(Array.from(tags).join('\n'));
}

dumpDatasets(process.argv[2]).catch(console.error);
