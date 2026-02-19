
const fs = require('fs');
const path = require('path');

const dirs = ['.wwebjs_auth', '.wwebjs_cache'];

dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
        console.log(`Removing ${fullPath}...`);
        try {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log('Success.');
        } catch (e) {
            console.error(`Failed to remove ${fullPath}:`, e.message);
        }
    } else {
        console.log(`${fullPath} does not exist.`);
    }
});
