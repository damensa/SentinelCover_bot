import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
const qrcode = require('qrcode-terminal');
import { OpenAI } from 'openai';
import { detectBrand, BRAND_ROUTER } from './router';
import { getDocText, listFolderFiles } from './services/google';
import { readSentinelFile } from './services/local';
import { generateRITEReport, ReportData, validateReportData } from './pdf-generator';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { extractBrandAndModel, findManualFile, getManualText, validateErrorCode } from './manual-retriever';

const BRAND_HEADER = `🛡️ SENTINEL COVER | Assistent Tècnic
Un servei de Effiguard Tech SL
━━━━━━━━━━━━━━━━━━`;

const WELCOME_MESSAGE = `Hola! Benvingut a la beta de Sentinel Cover. Soc el teu assistent especialitzat en calderes i normativa RITE. Puc ajudar-te a diagnosticar avaries, resoldre dubtes legals o processar els teus tiquets de combustió. Comencem?`;

const SEEN_CONTACTS_PATH = path.join(process.cwd(), 'seen_contacts.json');

function isNewContact(number: string): boolean {
    try {
        if (!fs.existsSync(SEEN_CONTACTS_PATH)) {
            fs.writeFileSync(SEEN_CONTACTS_PATH, JSON.stringify([]));
        }
        const seen = JSON.parse(fs.readFileSync(SEEN_CONTACTS_PATH, 'utf8'));
        if (!seen.includes(number)) {
            seen.push(number);
            fs.writeFileSync(SEEN_CONTACTS_PATH, JSON.stringify(seen));
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

function getWhitelist(): string[] {
    try {
        const data = fs.readFileSync(path.join(process.cwd(), 'subscriptors.json'), 'utf8');
        return JSON.parse(data).subscriptors || [];
    } catch (error) {
        console.error('Error carregant subscriptors.json:', error);
        return [];
    }
}

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

client.on('qr', (qr) => {
    console.log('--- NEW QR CODE GENERATED ---');
    qrcode.generate(qr, { small: true });
    console.log('Please scan the QR code above with your WhatsApp.');
});

client.on('authenticated', () => {
    console.log('WhatsApp authenticated successfully!');
});

client.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failure:', msg);
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready and listening!');
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp was disconnected:', reason);
});

client.on('message', async (msg) => {
    // Whitelist Check
    const whitelist = getWhitelist();
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const number = contact.number; // e.g., "34600000000"

    if (!whitelist.includes(number)) {
        // Opcionalment podem respondre una sola vegada o simplement ignorar
        console.log(`Accés denegat per al número: ${number}`);
        return;
    }

    let userText = "";
    let isAudio = false;

    if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
        isAudio = true;
    } else {
        userText = msg.body;
    }

    // Trigger Welcome Message
    if (isNewContact(number) || userText.toLowerCase().trim() === 'hola') {
        await msg.reply(WELCOME_MESSAGE);
        if (userText.toLowerCase().trim() === 'hola') return;
    }

    if (isAudio) {
        try {
            console.log('Received audio message...');
            const media = await msg.downloadMedia();
            const buffer = Buffer.from(media.data, 'base64');
            const tempPath = path.join(process.cwd(), `temp_${Date.now()}.ogg`);
            fs.writeFileSync(tempPath, buffer);

            // 1. Whisper Transcription
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempPath),
                model: 'whisper-1',
                language: 'ca', // Millora resultats per a usuaris catalans
            });

            userText = transcription.text;
            console.log('Transcription:', userText);

            // Delete temp file after transcription
            fs.unlinkSync(tempPath);
        } catch (error: any) {
            console.error('Error processing audio:', error);
            await msg.reply(`Error transcrinvint àudio: ${error.message}`);
            return;
        }
    }

    if (!userText) return;

    try {
        // 2. Extract Brand/Model and find Manual
        const modelMatch = await extractBrandAndModel(userText, openai);
        let manualContent = "";
        let manualFound = false;

        if (modelMatch.model) {
            const { filePath, actualBrandDir } = findManualFile(modelMatch.brand, modelMatch.model);

            // COHERENCE CHECK: Model matches a different brand than the one mentioned
            if (modelMatch.brand && actualBrandDir && modelMatch.brand.toLowerCase() !== actualBrandDir.toLowerCase()) {
                // Ignore ROCA/BAXI normalization for the alert
                const brandNormalizer: Record<string, string> = { 'roca': 'baxi', 'victoria': 'baxi' };
                const mb = brandNormalizer[modelMatch.brand.toLowerCase()] || modelMatch.brand.toLowerCase();
                const ab = brandNormalizer[actualBrandDir.toLowerCase()] || actualBrandDir.toLowerCase();

                if (mb !== ab) {
                    await msg.reply(`Atenció: El model ${modelMatch.model} no pertany a la marca ${modelMatch.brand}. Pertany a la marca ${actualBrandDir}. Vols que busqui l'error en el quadern correcte o t'has equivocat de nom?`);
                    return;
                }
            }

            if (filePath) {
                console.log(`Manual found: ${filePath}`);
                manualContent = await getManualText(filePath);
                manualFound = true;

                // ERROR CODE CHECK: If model is correct but error code is not in manual
                if (modelMatch.errorCode) {
                    const errorExists = validateErrorCode(manualContent, modelMatch.errorCode);
                    if (!errorExists) {
                        await msg.reply(`He verificat el manual de ${modelMatch.model} i el codi ${modelMatch.errorCode} no consta en la llista oficial d'errors. Podries confirmar el codi o descriure el símptoma?`);
                        return;
                    }
                }
            }
        }

        const isNormativeQuery = userText.toLowerCase().includes('rite') || userText.toLowerCase().includes('legal') || userText.toLowerCase().includes('normativa') || userText.toLowerCase().includes('procediment');
        const brandKey = isNormativeQuery ? 'normativa' : (modelMatch.brand?.toLowerCase() || detectBrand(userText));
        const brand = BRAND_ROUTER[brandKey] || { name: modelMatch.brand || 'Desconeguda', notebookId: 'N/A' };

        console.log(`Routing to ${brand.name}...`);

        // 3. Query Context
        const legalContext = `
            - El RITE (Reglament d'Instal·lacions Tècniques als Edificis) regula les condicions de seguretat, eficiència i manteniment. 
            - Per a la 'prova d'estanquitat', tot i que el RITE no especifica valors exactes, la norma UNE-EN 14336 estableix com a bona pràctica: 1,5 vegades la pressió de treball, amb un mínim de 6 bar.
            - Les intervencions han de ser realitzades per personal qualificat i documentades en un informe RITE.
        `;

        const systemPrompt = `
            Ets l'enginyer tècnic d'Effiguard Tech SL a càrrec de SENTINEL PRO.
            El teu to ha de ser: PRECIS, CULTE i DIRECTE al gra (estil d'enginyer).
            
            OBLIGATORI (Plantilla Sentinel Pro):
            1. FILTRE DE CONTINGUT: Si l'usuari fa preguntes que no tenen res a veure amb reparació de calderes, manteniment tèrmic, normativa RITE o el funcionament del bot, NO les responguis. Utilitza exclusivament aquest missatge: 'Hola! Soc l'assistent de SentinelCover. El meu coneixement es limita exclusivament a la reparació de calderes, manuals tècnics i normativa RITE. No puc ajudar-te amb altres temes. Com puc ajudar-te amb la teva instal·lació actual?'
            2. SIGUES PRECIS: Si l'usuari pregunta per un error, busca la taula de codis al manual i dona la solució exacta. Cita la pàgina si pots (ex: [Pàg. 24]).
            3. CITA EL RITE: No diguis 'la normativa diu', digues 'Segons el RITE (IT 3), és obligatori fer...' basant-te en el context legal proporcionat.
            4. TO PROFESSIONAL: Respostes CURTES, NUMERADES i amb les dades tècniques (bar, temperatures, CO) ben marcades en NEGRETA (ex: **1.2 bar**, **60°C**).
            5. NO SIGUES VAGUE: Si el manual diu 1.2 bar, no diguis 'una mica de pressió', digues literalment '**1.2 bar**'.
            6. ADMISSIÓ D'IGNORÀNCIA: Si no trobes el manual (Manual Trobat: NO), digues: 'No tinc el manual d'aquest model concret, vols que el busqui a internet o me'l puges al Drive?'.
            
            Idioma: CATALÀ.
            Context Legal/Normatiu:
            ${legalContext}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `
                        Manual Trobat: ${manualFound ? 'SI' : 'NO'}
                        Contingut Manual: ${manualContent.substring(0, 10000)} 
                        Marca/Model Detectats: ${brand.name} ${modelMatch.model || ''}
                        Context Legal: ${legalContext}
                        Consulta: ${userText}
                    `
                }
            ]
        });

        const aiResponse = completion.choices[0].message.content;

        // 4. Send Response with Branding
        let brandedResponse = `${BRAND_HEADER}\n\n${aiResponse}`;
        if (manualFound) {
            brandedResponse += `\n\n📖 Dada extreta del manual oficial indexat per Sentinel`;
        }

        await msg.reply(brandedResponse || "Ho sento, no he pogut generar una resposta.");

        // 5. Option for PDF Report
        if (userText.toLowerCase().includes('informe') || userText.toLowerCase().includes('pdf')) {
            const reportData: Partial<ReportData> = {
                brand: brandKey !== 'normativa' ? brand.name : undefined,
                technician: "Tècnic Sentinel",
                client: "Client Final", // TODO: Detectar dades del client del text
                issue: userText,
                action: aiResponse || undefined,
                normative: "RITE / Seguretat Industrial",
                date: new Date().toLocaleDateString('ca-ES')
            };

            const missingFields = validateReportData(reportData);
            if (missingFields.length > 0) {
                await msg.reply(`⚠️ Per generar l'informe RITE em falten les següents dades: ${missingFields.join(', ')}. Si us plau, proporciona-les per àudio.`);
                return;
            }

            const reportPath = path.join(process.cwd(), `report_${Date.now()}.pdf`);
            await generateRITEReport(reportData as ReportData, reportPath);
            const pdfMedia = MessageMedia.fromFilePath(reportPath);
            await client.sendMessage(msg.from, pdfMedia, { caption: 'Aquí tens l\'informe RITE generat.' });
            fs.unlinkSync(reportPath);
        }

    } catch (error: any) {
        console.error('Error processing message:', error);
        await msg.reply(`Error: ${error.message}`);
    }
});

client.initialize();
