import { dataExtractor } from './src/services/data-extractor';

async function testExtractor() {
    const sampleText = `Hola, les dades de l'ELEC1 son:
Titular: Joan Garcia Garcia, NIF 12345678Z, 600123456, joan@gmail.com
Carrer Major 12, Bloc A, Escala B, P1, Porta 2, Codi Postal 08201 Sabadell
CUPS ES0031400000000000XX
Actuació: Nova
Requisits: P1
Ús: Habitatge
Potència max: 5.75
Tensió: 230 V
IGA: 25A
Circuits: 5
LGA: 10
IGM: 20
Calibre CGP: 63A
Aillament conductors: 1M
Terra: 15 ohms
Aillament terra: 100M
Material conductor: Coure
Ubicació comptadors: Armari
Connexió: Assistida
Amb subministrament complementari: No`;

    console.log("Analyzing...");
    const result = await dataExtractor.extractElec1Data(sampleText, {});
    console.log("\nExtracted JSON:");
    console.log(JSON.stringify(result, null, 2));
}

testExtractor();
