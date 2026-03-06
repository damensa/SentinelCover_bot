import { classifierService } from './src/services/classifier';

async function testClassifier() {
    const testPhrases = [
        "hola bon dia",
        "vull fer el certificat de baixa tensió",
        "necessito el paper de la llum",
        "m'ajudes amb un butlletí elèctric?",
        "com es repara una caldera baxi?",
        "vull omplir el model ELEC-1",
        "tinc un error F1 a la vaillant"
    ];

    console.log('--- STARTING CLASSIFIER TEST ---');
    for (const phrase of testPhrases) {
        const result = await classifierService.classifyIntent(phrase);
        console.log(`\nPhrase: "${phrase}"`);
        console.log(`Intent: ${result.intent}`);
        console.log(`FormId: ${result.formId}`);
        console.log(`Confidence: ${result.confidence}`);
    }
    console.log('\n--- TEST FINISHED ---');
}

testClassifier().catch(console.error);
