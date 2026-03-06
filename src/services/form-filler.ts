import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// ELEC-1 Interface
export interface Elec1FormData {
    titular: { nomCognoms: string; nif: string; };
    adreca: { nomVia: string; numero: string; pis?: string; porta?: string; codiPostal: string; poblacio: string; };
    installacio: { nomVia: string; numero: string; codiPostal: string; poblacio: string; };
    caracteristiques: {
        potenciaMax: string; tensio: string; circuits: string; iga: string;
        resistenciaAillament: string; resistenciaTerra: string; calibreCGP: string; igm: string; lga: string; observacions: string;
        cups: string; tipusActuacio: string; requisits: string; us: string;
    };
}

// DR Interface
export interface DRFormData {
    titular: { nom: string; nif: string; };
    installacio: { tipus: string; campReglamentari: string; cups: string; };
    adreca: { nomVia: string; numero: string; poblacio: string; codiPostal: string; municipi: string; comarca: string; };
    declarant: { nom: string; nif: string; tipusPersona: string; };
}

// Contract Interface
export interface ContractFormData {
    titular: { nom: string; nif: string; adreca: string; poblacio: string; codiPostal: string; email: string; };
    representant: { nom: string; dni: string; };
    data: { dia: string; mes: string; any: string; ciutat: string; };
}

// ELEC-2 Interface
export interface Elec2Circuit {
    receptor: string;
    potencia: string;
    seccio: string;
    pia: string;
    diferencial: string;
}

export interface Elec2FormData {
    general: {
        empresa: string;
        tensio: string;
        seccioConexio: string;
        iga: string;
        potenciaContractada: string;
        emplaçament: string;
        titular: string;
    };
    circuits: Elec2Circuit[];
}

export class FormFillerService {
    private templatePath: string;
    private profilePath: string;

    constructor() {
        this.templatePath = path.join(process.cwd(), 'ELEC1_AcroForm.pdf');
        this.profilePath = path.join(process.cwd(), 'installer_profile_example.json');
    }

    async fillELEC1PDF(data: Elec1FormData): Promise<string> {
        if (!fs.existsSync(this.templatePath)) throw new Error(`Template not found at ${this.templatePath}`);
        const pdfDoc = await PDFDocument.load(fs.readFileSync(this.templatePath));
        const form = pdfDoc.getForm();
        const safetyFill = (f: string, v: string) => { try { const field = form.getField(f); if (field && 'setText' in field) (field as any).setText(String(v || '')); } catch (e) { } };
        const tBase = 'DATA[0].principal[0].sTitular[0]';
        safetyFill(`${tBase}.NomCognoms[0]`, data.titular.nomCognoms);
        safetyFill(`${tBase}.NIF[0]`, data.titular.nif);
        safetyFill(`${tBase}.TXT_NomVia[0]`, data.adreca.nomVia);
        safetyFill(`${tBase}.TXT_Num[0]`, data.adreca.numero);
        safetyFill(`${tBase}.TXT_CodiPostal[0]`, data.adreca.codiPostal);
        safetyFill(`${tBase}.TXT_Poblacio[0]`, data.adreca.poblacio);
        const iBase = 'DATA[0].principal[0].sInstallacio[0].sAdreca[0]';
        safetyFill(`${iBase}.TXT_NomVia[0]`, data.installacio.nomVia);
        safetyFill(`${iBase}.TXT_Num[0]`, data.installacio.numero);
        safetyFill(`${iBase}.TXT_CodiPostal[0]`, data.installacio.codiPostal);
        safetyFill(`${iBase}.TXT_Poblacio[0]`, data.installacio.poblacio);
        const cBase = 'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0].sRequisits[0].sTotes[0]';
        safetyFill(`${cBase}.TXT_PotenciaMax[0]`, data.caracteristiques.potenciaMax);
        safetyFill(`${cBase}.TXT_Tensio[0]`, data.caracteristiques.tensio);
        safetyFill(`${cBase}.TXT_Interruptor[0]`, data.caracteristiques.iga);
        safetyFill(`${cBase}.sTipus[0].TXT_CUPS[0]`, data.caracteristiques.cups);
        const outputPath = path.join(process.cwd(), `ELEC1_filled_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, await pdfDoc.save());
        return outputPath;
    }

    async fillDRPDF(data: DRFormData): Promise<string> {
        const drPath = path.join(process.cwd(), 'DeclaracioResponsableInstallatcio.pdf');
        const pdfDoc = await PDFDocument.load(fs.readFileSync(drPath));
        const form = pdfDoc.getForm();
        const safetyFill = (f: string, v: string) => { try { const field = form.getField(f); if (field && 'setText' in field) (field as any).setText(String(v || '')); } catch (e) { } };
        safetyFill('DATA[0].TXT_Nom[0]', data.titular.nom);
        safetyFill('DATA[0].TXT_NumID[0]', data.titular.nif);
        safetyFill('DATA[0].ADRECA[0].ADRECA_POSTAL[0].NOM_VIA[0]', data.adreca.nomVia);
        safetyFill('DATA[0].ADRECA[0].ADRECA_POSTAL[0].NUM_VIA[0]', data.adreca.numero);
        safetyFill('DATA[0].ADRECA[0].ADRECA_POSTAL[0].POBLACIO[0]', data.adreca.poblacio);
        safetyFill('DATA[0].ADRECA[0].ADRECA_POSTAL[0].CODI_POSTAL[0]', data.adreca.codiPostal);
        const outputPath = path.join(process.cwd(), `DR_filled_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, await pdfDoc.save());
        return outputPath;
    }

    async fillContractPDF(data: ContractFormData): Promise<string> {
        const contractPath = path.join(process.cwd(), 'ContracteMantenimentBT.pdf');
        const pdfDoc = await PDFDocument.load(fs.readFileSync(contractPath));
        const form = pdfDoc.getForm();
        const safetyFill = (f: string, v: string) => { try { const field = form.getField(f); if (field && 'setText' in field) (field as any).setText(String(v || '')); } catch (e) { } };
        safetyFill('Nom i Cognoms', data.titular.nom);
        safetyFill('NIF', data.titular.nif);
        safetyFill('Domicili social', data.titular.adreca);
        safetyFill('CIUTAT', data.data.ciutat);
        safetyFill('DIA', data.data.dia);
        safetyFill('MES', data.data.mes);
        safetyFill('de 20', data.data.any);
        const outputPath = path.join(process.cwd(), `ContracteBT_filled_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, await pdfDoc.save());
        return outputPath;
    }

    async fillElec2PDF(data: Elec2FormData): Promise<string> {
        console.log('Filling ELEC-2 PDF with dynamic drawing...');
        const templatePath = path.join(process.cwd(), 'EsquemaUnifilarELEC2.pdf');
        const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
        const page = pdfDoc.getPage(0);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const { height } = page.getSize();

        // Coordinates for Portrait page with rotated content
        // Drawing is rotated CCW, meaning X on drawing = Y on page (inverted), Y on drawing = X on page
        // Let's use simple drawing coordinates and rotate text 90deg
        const drawText = (text: string, x: number, y: number, size = 10) => {
            page.drawText(String(text || ''), {
                x, y, size, font, color: rgb(0, 0, 0), rotate: degrees(90)
            });
        };

        // 1. General Info (Bottom of drawing = Right of page)
        drawText(data.general.empresa, 20, 100);
        drawText(data.general.seccioConexio, 20, 230);
        drawText(data.general.tensio, 20, 390);
        drawText(data.general.emplaçament, 50, 100);
        drawText(data.general.titular, 100, 100);
        drawText(data.general.iga, 150, 390);

        // 2. Circuits (C through Z)
        // Horizontal columns in drawing = Vertical columns on Portrait page
        // Column C starts at some Y coordinate on portrait page
        const circuitStartY = 735; // Approx top of drawing grid (left side of page)
        const columnStepY = 18;  // Step between C, D, E...

        data.circuits.forEach((c, i) => {
            const currentY = circuitStartY - (i * columnStepY);
            if (currentY < 100) return; // Guard

            drawText(c.potencia, 545, currentY, 8);
            drawText(c.receptor, 520, currentY, 7);
            drawText(c.seccio, 460, currentY, 8);
            drawText(c.pia, 415, currentY, 8);
            drawText(c.diferencial, 360, currentY, 8);
        });

        const outputPath = path.join(process.cwd(), `ELEC2_filled_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, await pdfDoc.save());
        return outputPath;
    }
}
