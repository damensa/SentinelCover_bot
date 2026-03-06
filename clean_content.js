const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.cwd(), 'full_context_content.txt');
const outputPath = path.join(process.cwd(), 'docs', 'context_instaladors.md');

try {
    const rawContent = fs.readFileSync(inputPath, 'utf8');
    const startMarker = '--- CONTENT START ---';
    const endMarker = '--- CONTENT END ---';

    const startIndex = rawContent.indexOf(startMarker);
    const endIndex = rawContent.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
        const extractedText = rawContent.substring(startIndex + startMarker.length, endIndex).trim();

        if (!fs.existsSync(path.dirname(outputPath))) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }

        fs.writeFileSync(outputPath, extractedText, 'utf8');
        console.log(`Cleaned content saved to ${outputPath}`);
    } else {
        console.error('Markers not found in the file.');
    }
} catch (err) {
    console.error('Error cleaning content:', err.message);
}
