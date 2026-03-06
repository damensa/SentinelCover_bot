import { classifierService } from './src/services/classifier';
import { dataExtractor } from './src/services/data-extractor';

async function verifyElec2() {
    console.log('--- VERIFYING ELEC-2 (UNIFILAR) FLOW ---');

    // 1. Check intent recognition
    const phrase = "vull fer un esquema unifilar";
    const classification = await classifierService.classifyIntent(phrase);
    console.log(`Phrase: "${phrase}"`);
    console.log(`Classification: ${classification.intent}, ${classification.formId}`);

    if (classification.formId === 'elec2_unifilar') {
        console.log('✅ Intent recognition OK');
    } else {
        console.log('❌ Intent recognition FAILED');
    }

    // 2. Check general data extraction
    const genMessage = "Empresa Endesa, tensió 230V, IGA 25A i potencia 5.75kW";
    const extractedGen = await dataExtractor.extractElec2Data(genMessage);
    console.log('\nExtracted General Data:', JSON.stringify(extractedGen, null, 2));

    if (extractedGen.general?.empresa === 'Endesa' && extractedGen.general?.iga === '25A') {
        console.log('✅ General data extraction OK');
    } else {
        console.log('❌ General data extraction FAILED');
    }

    // 3. Check circuit data extraction
    const circMessage = "Pel circuit C: Forn i placa, potencia 3.5kW, secció 6mm i PIA 25A";
    const extractedCirc = await dataExtractor.extractElec2Data(circMessage);
    console.log('\nExtracted Circuit Data:', JSON.stringify(extractedCirc, null, 2));

    if (extractedCirc.circuit?.receptor === 'Forn i placa' && extractedCirc.circuit?.pia === '25A') {
        console.log('✅ Circuit data extraction OK');
    } else {
        console.log('❌ Circuit data extraction FAILED');
    }
}

verifyElec2().catch(console.error);
