import { classifierService } from './src/services/classifier';
import { dataExtractor } from './src/services/data-extractor';

async function verifyContract() {
    console.log('--- VERIFYING CONTRACT FLOW ---');

    // 1. Check intent recognition
    const phrase = "vull fer un contracte de manteniment de baixa tensió";
    const classification = await classifierService.classifyIntent(phrase);
    console.log(`Phrase: "${phrase}"`);
    console.log(`Classification: ${classification.intent}, ${classification.formId}`);

    if (classification.formId === 'contracte_bt') {
        console.log('✅ Intent recognition OK');
    } else {
        console.log('❌ Intent recognition FAILED');
    }

    // 2. Check data extraction
    const dataMessage = "Sóc en Pere Pou amb NIF 87654321B. Em pots fer el contracte pel carrer Gran 4, Mataró 08301. El meu email és pere@mail.com";
    const extracted = await dataExtractor.extractContractData(dataMessage);
    console.log('\nExtracted Data:', JSON.stringify(extracted, null, 2));

    if (extracted.titular?.nom && extracted.titular?.email) {
        console.log('✅ Data extraction OK');
    } else {
        console.log('❌ Data extraction FAILED');
    }
}

verifyContract().catch(console.error);
