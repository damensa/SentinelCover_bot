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
}

export const dataExtractor = new DataExtractorService();
