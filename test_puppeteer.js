const puppeteer = require('puppeteer');
const path = require('path');
require('dotenv').config();

(async () => {
    console.log('--- Puppeteer Diagnostic ---');
    console.log('Executable Path:', process.env.PUPPETEER_EXECUTABLE_PATH);

    try {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: ['--no-sandbox']
        });
        console.log('✅ Browser launched successfully!');
        const version = await browser.version();
        console.log('Browser version:', version);
        await browser.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Browser failed to launch:');
        console.error(error);
        process.exit(1);
    }
})();
