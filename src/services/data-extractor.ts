import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { Elec1FormData } from './form-filler';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class DataExtractorService {
    async extractElec1Data(text: string, currentData: Partial<Elec1FormData> = {}): Promise<Partial<Elec1FormData>> {
        console.log('[AI Extractor] Analyzing text:', text);

        const systemPrompt = `
            Ets un assistent especialitzat en l'extracció de dades per a certificats elèctrics (ELEC1).
            La teva feina és extreure dades del text de l'usuari i retornar un JSON net.

            Esquema del JSON a retornar:
            {
              "titular": { "nomCognoms": string, "nif": string },
              "adreca": { "nomVia": string, "numero": string, "pis": string, "porta": string, "codiPostal": string, "poblacio": string },
              "caracteristiques": { 
                "potenciaMax": string, 
                "tensio": string,
                "circuits": string,
                "iga": string,
                "resistenciaAillament": string,
                "resistenciaTerra": string,
                "calibreCGP": string,
                "igm": string,
                "lga": string,
                "observacions": string,
                "cups": string,
                "tipusActuacio": "Nova" | "Ampliació" | "Modificació",
                "requisits": "P1" | "P2" | "MTD",
                "us": string
              }
            }

            IMPORTANT:
            - CUPS: Sol començar per "ES" seguit de molts números.
            - Tipus d'actuació: "Nova", "Ampliació" o "Reforma/Modificació".
            - Requisits: "P1", "P2" o "Memòria tècnica/MTD".
            - Ús: Només si es menciona l'ús (ex: "habitatge", "local comercial", "garatge", "industrial").
            - Reconeix termes tècnics: IGA, IGM, LGA, CGP, Aïllament, Terra.
            - Qualsevol text addicional que sembli una nota, posa-lo a "observacions".
            - Si una dada no hi és, no la incloguis o deixa-la null.
            - Dades actuals per context: ${JSON.stringify(currentData)}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return {};

            return JSON.parse(content);
        } catch (error) {
            console.error('[AI Extractor] Error:', error);
            return {};
        }
    }

    async extractDRData(text: string, currentData: any = {}): Promise<any> {
        console.log('[AI Extractor DR] Analyzing text:', text);

        const systemPrompt = `
            Ets un assistent especialitzat en l'extracció de dades per a la "Declaració Responsable d'Instal·lació".
            Extrau les dades del text de l'usuari i retorna un JSON net.

            Esquema del JSON a retornar:
            {
              "titular": { "nom": string, "nif": string },
              "installacio": { 
                "tipus": string, // ex: "Baixa Tensió", "Grua", "Químics", "Pressió"
                "campReglamentari": string,
                "cups": string 
              },
              "adreca": { "nomVia": string, "numero": string, "poblacio": string, "codiPostal": string, "municipi": string, "comarca": string },
              "declarant": { "nom": string, "nif": string, "tipusPersona": "TIT" | "REP" }
            }

            IMPORTANT:
            - Tipus d'instal·lació: Intenta identificar el reglament o tipus (ex: PESS de grua, BT per baixa tensió, etc.).
            - Si l'usuari diu "soc el titular", tipusPersona és "TIT". Si és un representant, "REP".
            - No inventis dades, si no hi són, deixa-les null.
            - Dades actuals: ${JSON.stringify(currentData)}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return {};

            return JSON.parse(content);
        } catch (error) {
            console.error('[AI Extractor DR] Error:', error);
            return {};
        }
    }

    async extractContractData(text: string, currentData: any = {}): Promise<any> {
        console.log('[AI Extractor Contract] Analyzing text:', text);

        const systemPrompt = `
            Ets un assistent especialitzat en l'extracció de dades per a un "Contracte de manteniment de baixa tensió".
            Extrau les dades del text de l'usuari i retorna un JSON net.

            Esquema del JSON a retornar:
            {
              "titular": { "nom": string, "nif": string, "adreca": string, "poblacio": string, "codiPostal": string, "email": string },
              "representant": { "nom": string, "dni": string },
              "data": { "dia": string, "mes": string, "any": string, "ciutat": string }
            }

            IMPORTANT:
            - Si l'usuari no especifica la data, deixa els camps null o utilitza la data actual si sembla pertinent.
            - L'any sol ser "26" o "2026".
            - No inventis dades, si no hi són, deixa-les null.
            - Dades actuals: ${JSON.stringify(currentData)}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return {};

            return JSON.parse(content);
        } catch (error) {
            console.error('[AI Extractor Contract] Error:', error);
            return {};
        }
    }

    async extractElec2Data(text: string, currentData: any = {}): Promise<any> {
        console.log('[AI Extractor ELEC2] Analyzing text:', text);

        const systemPrompt = `
            Ets un assistent especialitzat en l'extracció de dades per a un "Esquema Unifilar ELEC-2".
            Extrau les dades del text de l'usuari i retorna un JSON net.

            Esquema del JSON a retornar:
            {
              "general": { 
                "empresa": string, 
                "tensio": string, 
                "seccioConexio": string, 
                "iga": string, 
                "potenciaContractada": string,
                "emplaçament": string,
                "titular": string
              },
              "circuit": {
                "receptor": string,
                "potencia": string,
                "seccio": string,
                "pia": string,
                "diferencial": string
              }
            }

            IMPORTANT:
            - Si l'usuari descriu dades de l'escomesa o titular, posa-les a "general".
            - Si l'usuari descriu dades d'un circuit individual, posa-les a "circuit".
            - No inventis dades, si no hi són, deixa-les null.
            - Dades actuals per a context: ${JSON.stringify(currentData)}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return {};

            return JSON.parse(content);
        } catch (error) {
            console.error('[AI Extractor ELEC2] Error:', error);
            return {};
        }
    }
}

export const dataExtractor = new DataExtractorService();
