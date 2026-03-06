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

    console.log('Searching for the file...');
    const res = await drive.files.list({
        q: "name contains 'Formularis instal·ladors' and trashed = false",
        fields: 'files(id, name, mimeType)',
    });

    const files = res.data.files;
    if (!files || files.length === 0) {
        console.log('No files found.');
        return;
    }

    const targetFile = files[0];
    console.log(`Found: ${targetFile.name} (ID: ${targetFile.id}, Type: ${targetFile.mimeType})`);

    if (targetFile.mimeType === 'application/vnd.google-apps.document') {
        console.log('Reading content...');
        const doc = await docs.documents.get({ documentId: targetFile.id });
        const text = doc.data.body.content.map(c => {
            if (c.paragraph) {
                return c.paragraph.elements.map(e => (e.textRun ? e.textRun.content : '')).join('');
            }
            return '';
        }).join('\n');

        console.log('--- CONTENT START ---');
        console.log(text);
        console.log('--- CONTENT END ---');
    } else {
        console.log(`MimeType ${targetFile.mimeType} not handled.`);
    }
}

searchAndRead().catch(console.error);
