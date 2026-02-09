import fs from 'fs';
import path from 'path';
const pdf = require('pdf-parse');
import { OpenAI } from 'openai';

const MANUALS_DIR = 'C:/Users/dave_/Sentinel cover/manuals_calderas';

interface ModelMatch {
    brand: string;
    model: string;
    filePath?: string;
}

export async function extractBrandAndModel(text: string, openai: OpenAI): Promise<ModelMatch> {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
            {
                role: "system",
                content: "Extract the boiler brand and model from the user query. Output JSON: { brand: string | null, model: string | null }. If not sure, return null."
            },
            { role: "user", content: text }
        ],
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
        brand: result.brand,
        model: result.model
    };
}

export function findManualFile(brand: string, model: string): string | null {
    if (!brand && !model) return null;

    console.log(`Searching for manual: Brand=${brand}, Model=${model}`);

    let normalizedBrand = brand;
    if (brand && (brand.toUpperCase() === 'ROCA' || brand.toUpperCase() === 'VICTORIA')) {
        normalizedBrand = 'BAXI';
        console.log(`Normalized brand to BAXI`);
    }

    let matchedFilePath: string | null = null;

    if (normalizedBrand) {
        const dirs = fs.readdirSync(MANUALS_DIR);
        const matchedDir = dirs.find(d =>
            d.toLowerCase() === normalizedBrand.toLowerCase() ||
            d.toLowerCase().includes(normalizedBrand.toLowerCase()) ||
            normalizedBrand.toLowerCase().includes(d.toLowerCase())
        );

        if (matchedDir) {
            console.log(`Found brand directory: ${matchedDir}`);
            matchedFilePath = findInDir(path.join(MANUALS_DIR, matchedDir), model);
        }
    }

    // Fallback: If not found by brand, or no brand provided, search all directories for the model
    if (!matchedFilePath && model) {
        console.log(`Falling back to global search for model: ${model}`);
        const dirs = fs.readdirSync(MANUALS_DIR);
        for (const dir of dirs) {
            const filePath = findInDir(path.join(MANUALS_DIR, dir), model);
            if (filePath) {
                console.log(`Fallback SUCCESS: Found in ${dir}`);
                return filePath;
            }
        }
    }

    return matchedFilePath;
}

function findInDir(dir: string, model: string): string | null {
    const files = fs.readdirSync(dir);
    // console.log(`Checking directory: ${dir} (${files.length} files)`);

    if (!model) {
        const firstPdf = files.find(f => f.toLowerCase().endsWith('.pdf'));
        return firstPdf ? path.join(dir, firstPdf) : null;
    }

    const normalizedModel = model.toLowerCase().replace(/[^a-z0-9]/g, '');
    // console.log(`Normalized requested model: ${normalizedModel}`);

    // 1. Precise include
    let matchedFile = files.find(f => {
        if (!f.toLowerCase().endsWith('.pdf')) return false;
        const normalizedFile = f.toLowerCase().replace('.pdf', '').replace(/[^a-z0-9]/g, '');
        return normalizedFile.includes(normalizedModel);
    });

    if (matchedFile) {
        // console.log(`Found via precise match: ${matchedFile}`);
        return path.join(dir, matchedFile);
    }

    // 2. Fallback: Check if the model contains the filename (e.g. searching for "Victoria 20/20" matches "manual_baxi_victoria.pdf")
    matchedFile = files.find(f => {
        if (!f.toLowerCase().endsWith('.pdf')) return false;
        let normalizedFile = f.toLowerCase().replace('.pdf', '').replace(/[^a-z0-9]/g, '').replace('manual', '');

        // Remove brand prefix if present
        const brandName = path.basename(dir).toLowerCase();
        if (normalizedFile.startsWith(brandName)) {
            normalizedFile = normalizedFile.substring(brandName.length);
        }

        if (normalizedFile.length < 3) return false;

        const isMatch = normalizedModel.includes(normalizedFile);
        // console.log(`Fallback check: File="${f}" NormalizedPart="${normalizedFile}" -> Match=${isMatch}`);
        return isMatch;
    });

    if (matchedFile) {
        // console.log(`Found via fallback match: ${matchedFile}`);
        return path.join(dir, matchedFile);
    }

    return null;
}

export async function getManualText(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}
