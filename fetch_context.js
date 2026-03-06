const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function authorize() {
    const TOKEN_PATH = path.join(process.cwd(), 'token.json');
    const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
}

async function searchAndRead() {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth: auth });
    const docs = google.docs({ version: 'v1', auth: auth });

    const fileName = 'Formularis instal·ladors electricitat, fontaneria, telecomunicacions';
    const res = await drive.files.list({
        q: `name = '${fileName}' and trashed = false`,
        fields: 'files(id, name, mimeType)',
    });

    const file = res.data.files[0];
    if (!file) {
        console.error('File not found');
        return;
    }

    const doc = await docs.documents.get({ documentId: file.id });
    const text = doc.data.body.content.map(c => {
        if (c.paragraph) {
            return c.paragraph.elements.map(e => (e.textRun ? e.textRun.content : '')).join('');
        }
        return '';
    }).join('\n');

    const outputPath = path.join(process.cwd(), 'docs', 'context_instaladors.md');
    if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, text, 'utf8');
    console.log(`Successfully saved context to ${outputPath}`);
}

searchAndRead().catch(console.error);
