import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
const qrcode = require('qrcode-terminal');
import { OpenAI } from 'openai';
import { detectBrand, BRAND_ROUTER } from './router';
import { listFolderFiles, getDocText, searchFiles, downloadFile } from './services/google';
import { readSentinelFile } from './services/local';
import { generateRITEReport, ReportData, validateReportData } from './pdf-generator';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { extractBrandAndModel, findManualFile, getManualText, validateErrorCode, validateBrandModelWithCatalog, getCanonicalBrand, getCanonicalModel, getSmartContext, getKeywordContext } from './manual-retriever';
import { FormFillerService, Elec1FormData } from './services/form-filler';
import { dataExtractor } from './services/data-extractor';
import { classifierService } from './services/classifier';

import { dbService, UserSession } from './services/db';
import { queueService } from './services/queue-service';
import './worker'; // Import worker to start it in the same process

const formFiller = new FormFillerService();

async function handleFormFlow(msg: any, state: UserSession) {
    const text = msg.body.trim();

    if (text.toLowerCase() === 'cancel·lar' || text.toLowerCase() === 'cancelar') {
        dbService.clearSession(msg.from);
        await msg.reply('❌ Procés certificat elèctric cancel·lat.');
        return;
    }

    switch (state.step) {
        case 0: // Waiting for Personal Data Block
            await msg.reply('📝 *BLOC 1: DADES PERSONALS*\n\nSi us plau, envia\'m les dades del **Titular** i l\'**Adreça** de la instal·lació (Nom complet, NIF/NIE, Carrer, Número, Codi Postal i Població) en un sol missatge.');
            state.step = 1;
            break;

        case 1: // Processing Personal Data Block
            try {
                const extracted = await dataExtractor.extractElec1Data(text, state.data);
                state.data = { ...state.data, ...extracted };

                // Minimal validation for block 1
                if (!state.data.titular?.nomCognoms || !state.data.adreca?.codiPostal) {
                    await msg.reply('⚠️ Sembla que falten algunes dades importants (Nom o Codi Postal). Me les pots tornar a passar o completar-les?');
                    return;
                }

                await msg.reply('✅ Dades personals capturades.');
                await msg.reply('⚡ *BLOC 2: DADES TÈCNIQUES*\n\nIndica\'m els detalls de la instal·lació:\n- **CUPS** (Codi de subministrament)\n- **Tipus d\'actuació** (Nova, Ampliació o Reforma)\n- **Requisits** (P1, P2 o MTD) i **Ús** (Habitatge, Local...)\n- Potència (kW), Tensió, Circuits, IGA, IGM, LGA i Terra');
                state.step = 2;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error processant les dades. Torna-ho a provar o escriu "cancel·lar".');
            }
            break;

        case 2: // Processing Technical Data Block
            try {
                const extracted = await dataExtractor.extractElec1Data(text, state.data);
                state.data = { ...state.data, ...extracted };

                if (!state.data.caracteristiques?.potenciaMax && !state.data.caracteristiques?.cups) {
                    await msg.reply('⚠️ Em falten dades per poder continuar (Potència o CUPS).');
                    return;
                }

                await msg.reply('✅ Dades tècniques rebudes.');
                await msg.reply('📝 *BLOC 3: OBSERVACIONS*\n\nVols afegir alguna observació o nota important al certificat? (Escriu la teva nota o "no" per acabar)');
                state.step = 3;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error processant dades tècniques.');
            }
            break;

        case 3: // Processing Observations & Generating PDF
            try {
                if (text.toLowerCase() !== 'no') {
                    const extracted = await dataExtractor.extractElec1Data(text, state.data);
                    state.data = { ...state.data, ...extracted };
                }

                await msg.reply('⏳ Generant el certificat final amb el teu perfil d\'instal·lador, un moment...');

                const formData: Elec1FormData = {
                    titular: {
                        nomCognoms: state.data.titular?.nomCognoms || '',
                        nif: state.data.titular?.nif || ''
                    },
                    adreca: {
                        nomVia: state.data.adreca?.nomVia || '',
                        numero: state.data.adreca?.numero || '',
                        codiPostal: state.data.adreca?.codiPostal || '',
                        poblacio: state.data.adreca?.poblacio || 'Sabadell',
                        pis: state.data.adreca?.pis || '',
                        porta: state.data.adreca?.porta || ''
                    },
                    installacio: {
                        nomVia: state.data.installacio?.nomVia || state.data.adreca?.nomVia || '',
                        numero: state.data.installacio?.numero || state.data.adreca?.numero || '',
                        codiPostal: state.data.installacio?.codiPostal || state.data.adreca?.codiPostal || '',
                        poblacio: state.data.installacio?.poblacio || state.data.adreca?.poblacio || 'Sabadell'
                    },
                    caracteristiques: {
                        potenciaMax: state.data.caracteristiques?.potenciaMax || '5.75',
                        tensio: state.data.caracteristiques?.tensio || '230',
                        circuits: state.data.caracteristiques?.circuits || '2',
                        iga: state.data.caracteristiques?.iga || '25A',
                        resistenciaAillament: state.data.caracteristiques?.resistenciaAillament || '100',
                        resistenciaTerra: state.data.caracteristiques?.resistenciaTerra || '15',
                        calibreCGP: state.data.caracteristiques?.calibreCGP || '',
                        igm: state.data.caracteristiques?.igm || '',
                        lga: state.data.caracteristiques?.lga || '',
                        observacions: state.data.caracteristiques?.observacions || '',
                        cups: state.data.caracteristiques?.cups || '',
                        tipusActuacio: state.data.caracteristiques?.tipusActuacio || 'Nova',
                        requisits: state.data.caracteristiques?.requisits || 'P1',
                        us: state.data.caracteristiques?.us || 'Habitatge'
                    }
                };

                await queueService.addPdfJob('elec1', formData, msg.from);

                dbService.clearSession(msg.from);
            } catch (e: any) {
                console.error(e);
                await msg.reply(`❌ Error generant el PDF: ${e.message}`);
                dbService.clearSession(msg.from);
            }
            break;
    }
}

async function handleElec2FormFlow(msg: any, state: UserSession) {
    const text = msg.body.trim();

    if (text.toLowerCase() === 'cancel·lar' || text.toLowerCase() === 'cancelar') {
        dbService.clearSession(msg.from);
        await msg.reply('❌ Procés "Esquema Unifilar" cancel·lat.');
        return;
    }

    switch (state.step) {
        case 0:
            await msg.reply('⚡ *ESQUEMA UNIFILAR (ELEC-2)*\n\nComencem per les **Dades Generals**. Digue\'m:\n- Empresa Distribuidora\n- Tensió (V)\n- Secció Conexió Servei\n- IGA (A) i Potència Contractada (kW)');
            state.step = 1;
            dbService.saveSession(msg.from, state);
            break;

        case 1:
            try {
                const extracted = await dataExtractor.extractElec2Data(text, state.data);
                state.data.general = { ...state.data.general, ...extracted.general };
                await msg.reply('✅ Dades d\'escomesa capturades.');
                await msg.reply('🏠 *EMPLAÇAMENT I TITULAR*\n\nDigue\'m l\'**Adreça completa** de l\'obra i el **Nom del Titular**.');
                state.step = 2;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error processant dades generals.');
            }
            break;

        case 2:
            try {
                const extracted = await dataExtractor.extractElec2Data(text, state.data);
                state.data.general = { ...state.data.general, ...extracted.general };
                state.data.circuits = [];
                await msg.reply('✅ Dades d\'emplaçament desades.');
                await msg.reply('⚙️ *CIRCUITS*\n\nAnem pel primer (**Circuit C**). Digue\'m:\n- Receptor (ex: Forn, Cuina, Rentadora...)\n- Potència (kW)\n- Secció (mm²)\n- PIA (A)\n- Diferencial (A/mA)');
                state.step = 3;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error.');
            }
            break;

        case 3:
            try {
                const extracted = await dataExtractor.extractElec2Data(text, state.data);
                if (extracted.circuit) {
                    state.data.circuits.push(extracted.circuit);
                }

                const count = state.data.circuits.length;
                const nextLabel = String.fromCharCode(67 + count); // C is 67

                dbService.saveSession(msg.from, state);
                await msg.reply(`✅ Circuit ${String.fromCharCode(66 + count)} desat.`);
                await msg.reply(`Digue\'m les dades del següent circuit (**${nextLabel}**) o escriu *FINALITZAR* per generar el PDF.`);
            } catch (e) {
                await msg.reply('❌ Error en el circuit.');
            }
            break;
    }

    // Special check for finalization inside step 3
    if (text.toLowerCase() === 'finalitzar' || text.toLowerCase() === 'finalizar') {
        try {
            await msg.reply('⏳ *Generant Esquema Unifilar...* Estem dibuixant el plànol en segon pla. Te\'l enviaré en un moment.');

            await queueService.addPdfJob('elec2', state.data, msg.from);

            dbService.clearSession(msg.from);
        } catch (err: any) {
            await msg.reply(`❌ Error: ${err.message}`);
            dbService.clearSession(msg.from);
        }
    }
}
async function handleContractFormFlow(msg: any, state: UserSession) {
    const text = msg.body.trim();

    if (text.toLowerCase() === 'cancel·lar' || text.toLowerCase() === 'cancelar') {
        dbService.clearSession(msg.from);
        await msg.reply('❌ Procés "Contracte de Manteniment" cancel·lat.');
        return;
    }

    switch (state.step) {
        case 0:
            await msg.reply('📝 *CONTRACTE MANTENIMENT: BLOC 1*\n\nEnvia\'m les dades del **Titular** (Nom, NIF, Adreça, Població, Codi Postal i Email).');
            state.step = 1;
            dbService.saveSession(msg.from, state);
            break;

        case 1:
            try {
                const extracted = await dataExtractor.extractContractData(text, state.data);
                state.data = { ...state.data, ...extracted };

                if (!state.data.titular?.nom || !state.data.titular?.nif) {
                    await msg.reply('⚠️ Falten dades del Titular (Nom o NIF). Me les pots completar?');
                    return;
                }

                await msg.reply('✅ Dades capturades.');
                await msg.reply('👤 *BLOC 2: REPRESENTANT*\n\nSi hi ha un representant, indica el seu **Nom** i **DNI**. Si no, escriu "no".');
                state.step = 2;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error processant dades.');
            }
            break;

        case 2:
            try {
                if (text.toLowerCase() !== 'no') {
                    const extracted = await dataExtractor.extractContractData(text, state.data);
                    state.data = { ...state.data, ...extracted };
                }

                await msg.reply('📅 *BLOC 3: DATA i LLOC*\n\nIndica la **població** i la **data** (dia, mes i any) per al contracte. Si no dius res, usaré Sabadell i la data d\'avui.');
                state.step = 3;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error.');
            }
            break;

        case 3:
            try {
                const extracted = await dataExtractor.extractContractData(text, state.data);
                state.data = { ...state.data, ...extracted };

                // Default date logic
                const now = new Date();
                if (!state.data.data) state.data.data = {};
                state.data.data.dia = state.data.data.dia || String(now.getDate());
                state.data.data.mes = state.data.data.mes || now.toLocaleString('ca-ES', { month: 'long' });
                state.data.data.any = state.data.data.any || String(now.getFullYear()).substring(2);
                state.data.data.ciutat = state.data.data.ciutat || 'Sabadell';

                await msg.reply('⏳ *Generant Contracte de Manteniment...* Estem processant el document en segon pla.');

                await queueService.addPdfJob('contract', state.data, msg.from);

                dbService.clearSession(msg.from);
            } catch (err: any) {
                await msg.reply(`❌ Error: ${err.message}`);
                dbService.clearSession(msg.from);
            }
            break;
    }
}
async function handleDRFormFlow(msg: any, state: UserSession) {
    const text = msg.body.trim();

    if (text.toLowerCase() === 'cancel·lar' || text.toLowerCase() === 'cancelar') {
        dbService.clearSession(msg.from);
        await msg.reply('❌ Procés "Declaració Responsable" cancel·lat.');
        return;
    }

    switch (state.step) {
        case 0:
            await msg.reply('📝 *DECLARACIÓ RESPONSABLE: BLOC 1*\n\nEnvia\'m les dades del **Titular** (Nom i NIF) i l\'**Adreça** de la instal·lació (Carrer, Número, Població, Codi Postal, Municipi i Comarca).');
            state.step = 1;
            dbService.saveSession(msg.from, state);
            break;

        case 1:
            try {
                const extracted = await dataExtractor.extractDRData(text, state.data);
                state.data = { ...state.data, ...extracted };

                if (!state.data.titular?.nom || !state.data.adreca?.nomVia) {
                    await msg.reply('⚠️ Falten dades (Nom Titular o Carrer). Me les pots completar?');
                    return;
                }

                await msg.reply('✅ Dades capturades.');
                await msg.reply('⚙️ *BLOC 2: DETALLS*\n\nIndica\'m:\n- **Tipus d\'instal·lació** (ex: Grua, BT, Químics...)\n- **Camp Reglamentari** (ex: PESS de grua motoritzada)\n- **CUPS** (si en tens)');
                state.step = 2;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error processant dades.');
            }
            break;

        case 2:
            try {
                const extracted = await dataExtractor.extractDRData(text, state.data);
                state.data = { ...state.data, ...extracted };

                await msg.reply('👤 *BLOC 3: DECLARANT*\n\nQui fa la declaració? (Nom i NIF). Indica també si ets el **Titular** o un **Representant**.');
                state.step = 3;
                dbService.saveSession(msg.from, state);
            } catch (e) {
                await msg.reply('❌ Error.');
            }
            break;

        case 3:
            try {
                const extracted = await dataExtractor.extractDRData(text, state.data);
                state.data = { ...state.data, ...extracted };

                await msg.reply('⏳ *Generant Declaració Responsable...* Estem processant el tràmit en segon pla.');

                await queueService.addPdfJob('dr', state.data, msg.from);

                dbService.clearSession(msg.from);
            } catch (err: any) {
                await msg.reply(`❌ Error: ${err.message}`);
                dbService.clearSession(msg.from);
            }
            break;
    }
}

const BRAND_HEADER = `🛡️ SENTINEL COVER | Assistent Tècnic
Un servei de Effiguard Tech SL
━━━━━━━━━━━━━━━━━━`;

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions'
        ],
    },
    authTimeoutMs: 60000,
    qrMaxRetries: 10,
    restartOnAuthFail: true,
});

client.on('qr', (qr) => {
    console.log('--- NEW QR CODE GENERATED ---');
    console.log('If the terminal QR is unreadable, open this link:');
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}`);
    qrcode.generate(qr, { small: false });
    console.log('Please scan the QR code above with your WhatsApp.');
});

client.on('authenticated', () => {
    console.log('WhatsApp authenticated successfully!');
});

client.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failure:', msg);
});

client.on('ready', () => {
    console.log('--- WHATSAPP BOT IS READY AND LISTENING ---');
});

client.on('change_state', state => {
    console.log('--- CLIENT STATE CHANGED ---:', state);
});

client.on('loading_screen', (percent, message) => {
    console.log('--- LOADING SCREEN ---', percent, message);
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp was disconnected:', reason);
});

client.on('message', async (msg) => {
    const contact = await msg.getContact();
    const number = contact.number; // e.g., "34600000000"
    const from = msg.from;

    // 1. Whitelist Check (SQLite)
    if (!dbService.isSubscriber(number)) {
        console.log(`[AUTH] Accés denegat per al número: ${number}`);
        return;
    }

    // 2. Log Incoming Message
    dbService.logMessage(number, msg.body, 'user');

    console.log(`[MSG] De: ${number} | Body: "${msg.body}" | Type: ${msg.type} | HasMedia: ${msg.hasMedia}`);

    let userText = "";
    let isAudio = false;

    if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
        isAudio = true;
    } else {
        userText = msg.body;
    }

    // Trigger Welcome Message on "hola"
    if (userText.toLowerCase().trim() === 'hola') {
        const welcome = "Hola! Soc en Sentinel. Puc ajudar-te amb formularis BT (ELEC1, ELEC2, DR, Contracte) o resoldre dubtes tècnics de calderes. Què necessites?";
        await msg.reply(welcome);
        dbService.logMessage(number, welcome, 'bot');
        return;
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
                prompt: "Viessmann, Vitodens, Vaillant, Baxi, Roca, Ferroli, Saunier Duval, Junkers, Immergas, calderes, errors tècnics."
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

    // --- FORM FILLING LOGIC START ---

    // Check for existing session in DB
    const state = dbService.getSession(from);

    if (state && state.mode === 'form_elec1') {
        await handleFormFlow(msg, state);
        return;
    }

    if (state && state.mode === 'form_dr') {
        await handleDRFormFlow(msg, state);
        return;
    }

    if (state && state.mode === 'form_contract') {
        await handleContractFormFlow(msg, state);
        return;
    }

    if (state && state.mode === 'form_elec2') {
        await handleElec2FormFlow(msg, state);
        return;
    }

    // New intent classification
    const classification = await classifierService.classifyIntent(userText);
    console.log(`[DEBUG] Classification: intent=${classification.intent}, formId=${classification.formId}`);

    if (classification.intent === 'form_filling' && classification.formId === 'elec1') {
        const newState: UserSession = { mode: 'form_elec1', step: 0, data: {} };
        dbService.saveSession(from, newState);
        await handleFormFlow(msg, newState);
        return;
    }

    if (classification.intent === 'form_filling' && classification.formId === 'dr_installacio') {
        const newState: UserSession = { mode: 'form_dr', step: 0, data: {} };
        dbService.saveSession(from, newState);
        await handleDRFormFlow(msg, newState);
        return;
    }

    if (classification.intent === 'form_filling' && classification.formId === 'contracte_bt') {
        const newState: UserSession = { mode: 'form_contract', step: 0, data: {} };
        dbService.saveSession(from, newState);
        await handleContractFormFlow(msg, newState);
        return;
    }

    if (classification.intent === 'form_filling' && classification.formId === 'elec2_unifilar') {
        const newState: UserSession = { mode: 'form_elec2', step: 0, data: {} };
        dbService.saveSession(from, newState);
        await handleElec2FormFlow(msg, newState);
        return;
    }

    // --- FORM FILLING LOGIC END ---

    try {
        // 2. Extract Brand/Model and find Manual
        const modelMatch = await extractBrandAndModel(userText, openai);
        let manualContent = "";
        let manualFound = false;

        if (modelMatch.model) {
            // Determine the brand: Prioritize local phonetic detection
            const localBrand = detectBrand(userText);
            const userBrandRaw = (localBrand !== 'normativa') ? localBrand : (modelMatch.brand || 'normativa');
            const canonicalUserBrand = getCanonicalBrand(userBrandRaw);

            // Validation checks removed - go directly to NotebookLM when brand is detected
            console.log(`[DEBUG] userText: "${userText}"`);
            console.log(`[DEBUG] localBrand: "${localBrand}", modelMatch.brand: "${modelMatch.brand}"`);
            console.log(`[DEBUG] userBrandRaw: "${userBrandRaw}", Canonical: "${canonicalUserBrand}"`);
            console.log(`[DEBUG] Model: "${modelMatch.model}"`);


            const { filePath, actualBrandDir } = findManualFile(userBrandRaw, modelMatch.model);
            const canonicalActualBrand = getCanonicalBrand(actualBrandDir);

            console.log(`[DEBUG] actualBrandDir: "${actualBrandDir}", CanonicalActual: "${canonicalActualBrand}"`);
            console.log(`[DEBUG] filePath: "${filePath}"`);

            // Coherence check removed - trust brand detection

            const finalCanonicalModel = getCanonicalModel(canonicalUserBrand, modelMatch.model) || modelMatch.model;

            let finalFilePath = filePath;

            // Fallback: Search on Google Drive if not found locally
            if (!finalFilePath && modelMatch.model) { // Removed brand.notebookId !== 'N/A' check here, as it's done later for technical summaries
                const detectedBrandKey = detectBrand(userText);
                const extractedBrandCanonical = modelMatch.brand ? getCanonicalBrand(modelMatch.brand).toLowerCase() : 'normativa';
                const finalBrandKey = detectedBrandKey !== 'normativa' ? detectedBrandKey : (extractedBrandCanonical !== 'desconeguda' ? extractedBrandCanonical : 'normativa');
                const canonicalKey = finalBrandKey === 'normativa' ? 'normativa' : getCanonicalBrand(finalBrandKey).toLowerCase();
                const brand = BRAND_ROUTER[canonicalKey] || BRAND_ROUTER[finalBrandKey] || { name: modelMatch.brand || 'Desconeguda', notebookId: 'N/A' };

                if (brand.notebookId !== 'N/A') {
                    try {
                        console.log(`Searching for manual on Drive for ${brand.name} ${modelMatch.model}...`);
                        const driveFiles = await searchFiles(brand.notebookId, modelMatch.model);
                        const pdfFile = driveFiles?.find((f: any) => f.mimeType === 'application/pdf');

                        if (pdfFile) {
                            console.log(`✅ Found manual on Drive: ${pdfFile.name} (${pdfFile.id})`);
                            const tmpPath = path.join(process.cwd(), `temp_drive_${pdfFile.id}.pdf`);
                            await downloadFile(pdfFile.id, tmpPath);
                            finalFilePath = tmpPath;
                        }
                    } catch (driveErr) {
                        console.error('Error searching/downloading from Drive:', driveErr);
                    }
                }
            }

            if (finalFilePath) {
                try {
                    const fullManualText = await getManualText(finalFilePath);
                    manualContent = getSmartContext(fullManualText, modelMatch.errorCode);
                    manualFound = true;
                    modelMatch.model = finalCanonicalModel; // Update for AI
                    console.log(`Manual content extracted (${manualContent.length} chars).`);

                    // Cleanup if it was a temp file from Drive
                    if (finalFilePath.includes('temp_drive_')) {
                        fs.unlinkSync(finalFilePath);
                    }

                    // ERROR CODE CHECK
                    if (modelMatch.errorCode) {
                        const errorExists = validateErrorCode(fullManualText, modelMatch.errorCode);
                        if (!errorExists) {
                            await msg.reply(`He verificat el manual de ${modelMatch.model} i el codi ${modelMatch.errorCode} no consta en la llista oficial d'errors. Podries confirmar el codi o descriure el símptoma?`);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('Error reading manual:', err);
                }
            }
        }

        const isNormativeQuery = userText.toLowerCase().includes('rite') ||
            userText.toLowerCase().includes('legal') ||
            userText.toLowerCase().includes('normativa') ||
            userText.toLowerCase().includes('procediment') ||
            userText.toLowerCase().includes('distància') ||
            userText.toLowerCase().includes('distancia') ||
            userText.toLowerCase().includes('fums') ||
            userText.toLowerCase().includes('xemeneia') ||
            userText.toLowerCase().includes('tub') ||
            userText.toLowerCase().includes('façana') ||
            userText.toLowerCase().includes('instal·lació') ||
            userText.toLowerCase().includes('pendiente') ||
            userText.toLowerCase().includes('pendent');

        // IMPORTANT: Use canonical brand key for routing
        const detectedBrandKey = detectBrand(userText);
        // Canonicalize the brand extracted by OpenAI if local detection fails
        const extractedBrandCanonical = modelMatch.brand ? getCanonicalBrand(modelMatch.brand).toLowerCase() : 'normativa';

        // Determine the primary brand for manual lookup and brand-specific summaries
        const finalBrandKey = (detectedBrandKey !== 'normativa' ? detectedBrandKey : (extractedBrandCanonical !== 'desconeguda' ? extractedBrandCanonical : 'normativa'));
        const canonicalKey = finalBrandKey === 'normativa' ? 'normativa' : getCanonicalBrand(finalBrandKey).toLowerCase();

        const brand = BRAND_ROUTER[canonicalKey] || { name: modelMatch.brand || 'Desconeguda', notebookId: 'N/A' };

        console.log(`[DEBUG] Final Routing: key="${canonicalKey}", brandName="${brand.name}"`);

        // 3. Technical Summaries (NotebookLM / Drive Folders)
        let technicalSummaries = "";

        // Determine folders to search: Always include brand folder + normativa folder if relevant
        const foldersToSearch = [];
        if (brand.notebookId !== 'N/A' && canonicalKey !== 'normativa') {
            foldersToSearch.push({ id: brand.notebookId, name: brand.name, type: 'brand' });
        }
        if (isNormativeQuery || canonicalKey === 'normativa') {
            const normativaConfig = BRAND_ROUTER['normativa'];
            foldersToSearch.push({ id: normativaConfig.notebookId, name: normativaConfig.name, type: 'normativa' });
        }

        // --- MCP INTEGRATION START ---
        // 3. Technical Summaries (via MCP / NotebookLM)
        let mcpResponse = "";
        const { mcpService } = require('./services/mcp-client');

        // Determine if we should use MCP
        const useMcp = brand.notebookId !== 'N/A' && canonicalKey !== 'normativa';

        if (useMcp) {
            try {
                // await msg.reply("🔍 Consultant la documentació tècnica oficial..."); // Feedback
                console.log(`[MCP] Querying NotebookLM for ${brand.name}...`);

                const queryForNotebook = modelMatch.model
                    ? `Busca informació sobre el model ${modelMatch.model}. ${userText}`
                    : userText;

                const rawResp = await mcpService.queryNotebook(brand.notebookId, queryForNotebook);

                if (rawResp && !rawResp.startsWith("Error")) {
                    mcpResponse = rawResp;
                    technicalSummaries += `--- RESPOSTA OFICIAL DE LA MARCA (${brand.name}) ---\n${mcpResponse}\n\n`;
                    console.log(`[MCP] Got response (${mcpResponse.length} chars)`);
                } else {
                    console.warn(`[MCP] Query failed for ${brand.name}: ${rawResp}`);
                }

            } catch (e) {
                console.error("Error asking MCP:", e);
                // technicalSummaries += "Error consultant NotebookLM. Es procedirà amb coneixement general.\n";
            }
        }

        // Fallback or Augmentation: Normativa
        if (isNormativeQuery) {
            if (!useMcp) {
                const normativaConfig = BRAND_ROUTER['normativa'];
                if (normativaConfig && normativaConfig.notebookId) {
                    try {
                        if (!mcpResponse) {
                            // await msg.reply("🔍 Consultant la normativa RITE...");
                        }
                        console.log(`[MCP] Querying Normativa...`);
                        const rawResp = await mcpService.queryNotebook(normativaConfig.notebookId, userText);

                        if (rawResp && !rawResp.startsWith("Error")) {
                            technicalSummaries += `--- NORMATIVA RITE ---\n${rawResp}\n\n`;
                            mcpResponse = rawResp;
                        } else {
                            console.warn(`[MCP] Normative query failed: ${rawResp}`);
                        }
                    } catch (e) {
                        console.error("Error MCP Normativa:", e);
                    }
                }
            }
        }
        // --- DIRECT NOTEBOOKLM RESPONSE ---
        // Improvement: If we got a valid response from MCP (Brand or Normativa), send it directly.
        // This avoids OpenAI reprocessing, saves tokens, and reduces latency.
        if (mcpResponse && mcpResponse.length > 50 && !mcpResponse.includes("Error consultant")) {
            console.log("[MCP] Direct Mode: Sending response directly to user.");
            await msg.reply(technicalSummaries);
            return;
        }

        // --- MCP INTEGRATION END ---

        // Legacy Loop (Optional - kept for safety or removed if fully replaced)
        // For now, let's skip the legacy loop if MCP worked, or run it as backup?
        // The user wants to REPLACE the old logic essentially. 
        // Let's just comment out or bypass the old loop if mcpResponse is good.

        if (!mcpResponse) {
            // ... Only run legacy loop if MCP failed ...
            for (const folder of foldersToSearch) {
                try {
                    console.log(`Fetching summaries from folder: ${folder.name} (${folder.id})`);
                    const files = await listFolderFiles(folder.id);

                    // Filter logic
                    const relevantFiles = files?.filter((f: any) => {
                        const isDoc = f.mimeType === 'application/vnd.google-apps.document';
                        const isPdf = f.mimeType === 'application/pdf';
                        const fileNameUpper = f.name.toUpperCase();

                        if (folder.type === 'normativa') {
                            // In normative folder, we take everything relevant (usually PDFs)
                            return isDoc || isPdf;
                        } else {
                            // In brand folders, we take Docs or PDFs
                            return isDoc || isPdf;
                        }
                    }) || [];

                    // --- NEW GLOBAL RETRIEVER LOGIC ---
                    if (folder.type === 'normativa') {
                        const { globalNormativeSearch } = require('./global-retriever');
                        const globalContext = await globalNormativeSearch(userText, folder.id);
                        technicalSummaries = globalContext + "\n\n" + technicalSummaries;
                        continue; // Skip the old file-by-file loop for Normativa
                    }

                    for (const file of relevantFiles) {
                        if (file.mimeType === 'application/vnd.google-apps.document') {
                            const text = await getDocText(file.id);
                            technicalSummaries += `--- RESUM TÈCNIC (${folder.name}): ${file.name} ---\n${text}\n\n`;
                        } else if (file.mimeType === 'application/pdf') {
                            // Brand PDF summaries (file-by-file is fine for these, usually small)
                            console.log(`Extracting text from Brand PDF summary: ${file.name}`);
                            const tmpPath = path.join(process.cwd(), `temp_sum_${file.id}.pdf`);
                            await downloadFile(file.id, tmpPath);
                            const text = await getManualText(tmpPath);

                            // Simple 2-chunk context for brand PDFs
                            let processedText = getKeywordContext(text, userText, 2);
                            technicalSummaries += `--- RESUM TÈCNIC (${file.name}) ---\n${processedText}\n\n`;
                            fs.unlinkSync(tmpPath);
                        }
                    }
                } catch (e) {
                    console.error(`Error fetching summaries from ${folder.name}:`, e);
                }
            }
        }

        // Final safety truncation for technicalSummaries (~20k tokens max)
        technicalSummaries = technicalSummaries.substring(0, 80000);

        // 4. Query Context

        const legalContext = `
            - El RITE (Reglament d'Instal·lacions Tècniques als Edificis) regula les condicions de seguretat, eficiència i manteniment.
            - Les intervencions han de ser realitzades per personal qualificat i documentades en un informe RITE.
        `;

        const systemPrompt = `
            Ets l'enginyer tècnic d'Effiguard Tech SL a càrrec de SENTINEL PRO.
            El teu objectiu és donar DADES TÈCNIQUES EXACTES i LEGALS.

            ORDRE DE PRIORITAT D'INFORMACIÓ (CRÍTICA):

            1. **PRIORITAT ABSOLUTA - RESUMS TÈCNICS (NotebookLM/Marca)**: 
               - Si reps informació a la secció "FONT 1: RESUMS TÈCNICS", aquesta és la font OFICIAL i MÉS FIABLE.
               - SEMPRE utilitza aquesta informació PRIMER i COMPLETAMENT.
               - Si la resposta està aquí, NO diguis mai que "no disposes de la informació" o que "cal consultar el manual".
               - Aquesta informació prové directament de la documentació oficial de la marca.

            2. **PRIORITAT #2 - DOCUMENTS NORMATIUS (RITE/UNE)**:
               - Per a preguntes d'instal·lació general, utilitza la informació normativa.

            3. **PRIORITAT #3 - MANUAL OFICIAL (PDF)**:
               - Només si no hi ha informació a les fonts anteriors.

            REGLES CRÍTIQUES:
            1. **USA LA INFORMACIÓ PROPORCIONADA**: Si reps dades als "RESUMS TÈCNICS", utilitza-les DIRECTAMENT. No diguis que no tens la informació.
            2. **SIGUES ESPECÍFIC**: Proporciona dades tècniques exactes (distàncies, codis d'error, procediments).
            3. **CITA LA FONT**: Digues d'on ve la informació ("Segons la documentació oficial de [marca]...").
            4. **NO INVENTIS**: Només si REALMENT no tens cap dada, digues que no la trobes.
            5. **EVITA RESPOSTES GENÈRIQUES**: Si tens informació específica, NO donis respostes vagues com "consulta el manual".

            Idioma: CATALÀ TÈCNIC.
            Estil: Professional, sec, basat en dades.
            Context Legal/Normatiu (Introducció):
            ${legalContext}
        `;

        console.log(`[DEBUG] Technical Summaries being sent to OpenAI (first 1000 chars):`);
        console.log(technicalSummaries.substring(0, 1000));

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `
                        --- FONT 1: RESUMS TÈCNICS (NotebookLM) ---
                        ${technicalSummaries || 'No hi ha resums disponibles per aquesta marca.'}

                        --- FONT 2: MANUAL OFICIAL (PDF) ---
                        Manual Trobat: ${manualFound ? 'SI' : 'NO'}
                        Contingut del Manual (Extracte rellevant): 
                        "${manualContent}" 
                        
                        --- DADES DE LA CONSULTA ---
                        Marca/Model Detectats: ${brand.name} ${modelMatch.model || ''}
                        Codi d'Error a buscar: ${modelMatch.errorCode || 'Cap'}
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

        try {
            if (brandedResponse) {
                await msg.reply(brandedResponse);
                dbService.logMessage(number, brandedResponse, 'bot');
            } else {
                const fallback = aiResponse || "Ho sento, no he pogut generar una resposta.";
                await msg.reply(fallback);
                dbService.logMessage(number, fallback, 'bot');
            }
        } catch (sendError: any) {
            console.error('❌ Error enviant resposta WhatsApp:', sendError);
            // Fallback: intentar enviar sense citar (reply pot fallar si el missatge original ha desaparegut)
            try {
                await client.sendMessage(msg.from, brandedResponse || aiResponse || "Error intern.");
            } catch (retryError) {
                console.error('❌ Error final en enviament:', retryError);
            }
        }

        // 5. Option for PDF Report
        if (userText.toLowerCase().includes('informe') || userText.toLowerCase().includes('pdf')) {
            const reportData: Partial<ReportData> = {
                brand: finalBrandKey !== 'normativa' ? brand.name : undefined,
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
