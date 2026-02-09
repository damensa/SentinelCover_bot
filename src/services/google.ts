import { google } from 'googleapis';
import { authorize } from '../auth';

export async function getDriveClient() {
    const auth = await authorize();
    return google.drive({ version: 'v3', auth: auth as any });
}

export async function getDocsClient() {
    const auth = await authorize();
    return (google as any).documents({ version: 'v1', auth: auth as any });
}

export async function listFolderFiles(folderId: string) {
    const drive: any = await getDriveClient();
    const res = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, mimeType)',
    });
    return res.data.files;
}

export async function getDocText(fileId: string) {
    const doc: any = await getDocsClient();
    const res = await doc.documents.get({ documentId: fileId });
    const text = res.data.body?.content?.map((c: any) =>
        c.paragraph?.elements?.map((e: any) => e.textRun?.content).join('')
    ).join('\n') || '';
    return text;
}
