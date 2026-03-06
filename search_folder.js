const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Simplified auth for JS
async function getAuth() {
    const tokenPath = 'token.json';
    const content = fs.readFileSync(tokenPath, 'utf8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
}

async function run() {
    try {
        const auth = await getAuth();
        const drive = google.drive({ version: 'v3', auth });

        console.log('Searching for "Documents instaladors" folder...');
        const res = await drive.files.list({
            q: "name = 'Documents instaladors' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: 'files(id, name)'
        });

        const folders = res.data.files;
        if (!folders || folders.length === 0) {
            console.log('Folder not found exactly. Searching name contains...');
            const res2 = await drive.files.list({
                q: "name contains 'instaladors' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                fields: 'files(id, name)'
            });
            if (!res2.data.files || res2.data.files.length === 0) {
                console.log('No folders found at all.');
                return;
            }
            folders.push(...res2.data.files);
        }

        for (const folder of folders) {
            console.log(`\nFolder: ${folder.name} (ID: ${folder.id})`);
            const filesRes = await drive.files.list({
                q: `'${folder.id}' in parents and mimeType = 'application/pdf' and trashed = false`,
                fields: 'files(id, name)'
            });
            const files = filesRes.data.files;
            if (!files || files.length === 0) {
                console.log('  No PDFs found.');
            } else {
                files.forEach(f => console.log(`  - ${f.name} (ID: ${f.id})`));
            }
        }
    } catch (err) {
        console.error('ERROR:', err.message);
        if (err.response) console.error('Response data:', err.response.data);
    }
}

run();
