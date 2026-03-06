import { classifierService } from './src/services/classifier';
import { dataExtractor } from './src/services/data-extractor';

async function verifyDR() {
    console.log('--- VERIFYING DR FLOW ---');

    // 1. Check intent recognition
    const phrase = "vull omplir una declaració responsable d'instal·lació";
    const classification = await classifierService.classifyIntent(phrase);
    console.log(`Phrase: "${phrase}"`);
    console.log(`Classification: ${classification.intent}, ${classification.formId}`);

    if (classification.formId === 'dr_installacio') {
        console.log('✅ Intent recognition OK');
    } else {
        console.log('❌ Intent recognition FAILED');
    }

    // 2. Check data extraction
    const dataMessage = "El titular és Joan Vila amb NIF 12345678A. L'adreça és Carrer de la Pau 12, Sabadell 08202. És una instal·lació de baixa tensió.";
    const extracted = await dataExtractor.extractDRData(dataMessage);
    console.log('\nExtracted Data:', JSON.stringify(extracted, null, 2));

    if (extracted.titular?.nom && extracted.adreca?.nomVia) {
        console.log('✅ Data extraction OK');
    } else {
        console.log('❌ Data extraction FAILED');
    }
}

verifyDR().catch(console.error);
