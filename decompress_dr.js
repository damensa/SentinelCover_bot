const fs = require('fs');
const zlib = require('zlib');

const data = fs.readFileSync('dr_datasets.xml');
try {
    const inflated = zlib.unzipSync(data);
    console.log('✅ Unzipped version:');
    console.log(inflated.toString());
} catch (e) {
    try {
        const inflated = zlib.inflateSync(data);
        console.log('✅ Inflated version:');
        console.log(inflated.toString());
    } catch (e2) {
        console.log('❌ Failed to decompress. Raw:');
        console.log(data.toString());
    }
}
