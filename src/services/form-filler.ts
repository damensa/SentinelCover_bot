import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Interface for the data we want to collect
export interface Elec1FormData {
    titular: {
        nomCognoms: string;
        nif: string;
    };
    adreca: {
        nomVia: string;
        numero: string;
        pis?: string;
        porta?: string;
        codiPostal: string;
        poblacio: string;
    };
    installacio: {
        nomVia: string;
        numero: string;
        codiPostal: string;
        poblacio: string;
    };
    caracteristiques: {
        potenciaMax: string;
        tensio: string;
        circuits: string;
        iga: string;
        resistenciaAillament: string;
        resistenciaTerra: string;
        calibreCGP: string;
        igm: string;
        lga: string;
        observacions: string;
        // Phase 4 fields
        cups: string;
        tipusActuacio: string; // 'Nova', 'Ampliació', 'Modificació'
        requisits: string;      // 'P1', 'P2', 'MTD'
        us: string;
    };
}

export class FormFillerService {
    private templatePath: string;
    private profilePath: string;

    constructor() {
        this.templatePath = path.join(process.cwd(), 'ELEC1_AcroForm.pdf');
        this.profilePath = path.join(process.cwd(), 'installer_profile_example.json');
    }

    async fillELEC1PDF(data: Elec1FormData): Promise<string> {
        console.log('Filling ELEC1 PDF (Phase 4) with data:', JSON.stringify(data, null, 2));

        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Template not found at ${this.templatePath}`);
        }

        const pdfBytes = fs.readFileSync(this.templatePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();

        const safetyFill = (fieldName: string, value: string) => {
            try {
                const field = form.getField(fieldName);
                if (field && 'setText' in field) {
                    (field as any).setText(value || '');
                }
            } catch (e) {
                console.warn(`Could not fill text field ${fieldName}:`, e.message);
            }
        };

        const setRadio = (groupName: string, optionIndex: number) => {
            try {
                const group = form.getRadioGroup(groupName);
                const options = group.getOptions();
                if (options.length > optionIndex) {
                    group.select(options[optionIndex]);
                } else {
                    // Fallback for weird AcroForm structures
                    // Often 0, 1, 2 or "Off", "1", "2"
                    const val = optionIndex === 0 ? "Off" : String(optionIndex);
                    group.select(val);
                }
            } catch (e) {
                console.warn(`Could not set radio ${groupName}:`, e.message);
            }
        };

        // 1. Titular Data
        const tBase = 'DATA[0].principal[0].sTitular[0]';
        safetyFill(`${tBase}.NomCognoms[0]`, data.titular.nomCognoms);
        safetyFill(`${tBase}.NIF[0]`, data.titular.nif);
        safetyFill(`${tBase}.TXT_NomVia[0]`, data.adreca.nomVia);
        safetyFill(`${tBase}.TXT_Num[0]`, data.adreca.numero);
        safetyFill(`${tBase}.TXT_Pis[0]`, data.adreca.pis || '');
        safetyFill(`${tBase}.TXT_Porta[0]`, data.adreca.porta || '');
        safetyFill(`${tBase}.TXT_CodiPostal[0]`, data.adreca.codiPostal);
        safetyFill(`${tBase}.TXT_Poblacio[0]`, data.adreca.poblacio);

        // 2. Installacio Data
        const iBase = 'DATA[0].principal[0].sInstallacio[0].sAdreca[0]';
        safetyFill(`${iBase}.TXT_NomVia[0]`, data.installacio.nomVia);
        safetyFill(`${iBase}.TXT_Num[0]`, data.installacio.numero);
        safetyFill(`${iBase}.TXT_CodiPostal[0]`, data.installacio.codiPostal);
        safetyFill(`${iBase}.TXT_Poblacio[0]`, data.installacio.poblacio);

        // 3. Phase 4: Installation Characteristics
        const icBase = 'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0]';
        safetyFill(`${icBase}.sTipus[0].TXT_CUPS[0]`, data.caracteristiques.cups);
        safetyFill(`${icBase}.sRequisits[0].TXT_Us[0]`, data.caracteristiques.us);

        // Tipus d'actuació (Radio Group)
        // Options usually: 1=Nova, 2=Ampliació, 3=Modificació
        if (data.caracteristiques.tipusActuacio === 'Nova') setRadio(`${icBase}.sTipus[0].RB_TipusActuacio[0]`, 1);
        else if (data.caracteristiques.tipusActuacio === 'Ampliació') setRadio(`${icBase}.sTipus[0].RB_TipusActuacio[0]`, 2);
        else if (data.caracteristiques.tipusActuacio === 'Modificació') setRadio(`${icBase}.sTipus[0].RB_TipusActuacio[0]`, 3);

        // Requisits (Radio Group)
        // Options: 1=P1, 2=P2, 3=MTD
        if (data.caracteristiques.requisits === 'P1') setRadio(`${icBase}.sRequisits[0].RB_Requisits[0]`, 1);
        else if (data.caracteristiques.requisits === 'P2') setRadio(`${icBase}.sRequisits[0].RB_Requisits[0]`, 2);
        else if (data.caracteristiques.requisits === 'MTD') setRadio(`${icBase}.sRequisits[0].RB_Requisits[0]`, 3);

        // 4. Caracteristiques Tècniques
        const cBase = 'DATA[0].principal[0].sInstallacio[0].sCaracteristiques[0].sRequisits[0].sTotes[0]';
        safetyFill(`${cBase}.TXT_PotenciaMax[0]`, data.caracteristiques.potenciaMax);
        safetyFill(`${cBase}.TXT_Tensio[0]`, data.caracteristiques.tensio);
        safetyFill(`${cBase}.TXT_Circuits[0]`, data.caracteristiques.circuits);
        safetyFill(`${cBase}.TXT_Interruptor[0]`, data.caracteristiques.iga);
        safetyFill(`${cBase}.TXT_ResistenciaConductors[0]`, data.caracteristiques.resistenciaAillament);
        safetyFill(`${cBase}.TXT_ResistenciaTerra[0]`, data.caracteristiques.resistenciaTerra);
        safetyFill(`${cBase}.TXT_Calibre[0]`, data.caracteristiques.calibreCGP);
        safetyFill(`${cBase}.TXT_IGM[0]`, data.caracteristiques.igm);
        safetyFill(`${cBase}.TXT_SeccioLGA[0]`, data.caracteristiques.lga);

        // 5. Observacions
        safetyFill('DATA[0].principal[0].s9[0].TXT_Observacions[0]', data.caracteristiques.observacions);

        // 6. Installer Profile & Certification
        if (fs.existsSync(this.profilePath)) {
            try {
                const profile = JSON.parse(fs.readFileSync(this.profilePath, 'utf8'));
                const pBase = 'DATA[0].principal[0].sEmpresaIns[0]';

                safetyFill(`${pBase}.NomCognoms[0]`, profile.empresa);
                safetyFill(`${pBase}.TXT_Rasic[0]`, profile.rasic);
                safetyFill(`${pBase}.NIF[0]`, profile.nif);
                safetyFill(`${pBase}.NomCognomsInstalador[0]`, profile.nom_instal·lador);
                safetyFill(`${pBase}.TXT_Categoria[0]`, profile.categoria);
                safetyFill(`${pBase}.DNIInstallador[0]`, profile.dni_instal·lador);

                const paBase = `${pBase}.sAdreca[0]`;
                safetyFill(`${paBase}.TXT_NomVia[0]`, profile.adreca.nom_via);
                safetyFill(`${paBase}.TXT_Num[0]`, profile.adreca.numero);
                safetyFill(`${paBase}.TXT_CodiPostal[0]`, profile.adreca.codi_postal);
                safetyFill(`${paBase}.TXT_Poblacio[0]`, profile.adreca.poblacio);
                safetyFill(`${paBase}.TXT_Tel[0]`, profile.adreca.telefon);
                safetyFill(`${paBase}.TXT_Correu[0]`, profile.adreca.correu);

                // Certification (Nom de l'instal·lador)
                safetyFill('DATA[0].principal[0].s9[0].NomCognomsInstalador[0]', profile.nom_instal·lador);

            } catch (err) {
                console.error('Error loading installer profile:', err);
            }
        }

        const timestamp = Date.now();
        const outputPath = path.join(process.cwd(), `ELEC1_filled_${timestamp}.pdf`);
        const pdfBytesSaved = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytesSaved);

        return outputPath;
    }
}
