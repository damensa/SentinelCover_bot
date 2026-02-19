
const fs = require('fs');
const zlib = require('zlib');

const data = fs.readFileSync(process.argv[2]);

try {
    const inflated = zlib.inflateSync(data);
    fs.writeFileSync('output_inflated.xml', inflated);
    console.log('Success with inflateSync');
} catch (e) {
    console.log('Failed with inflateSync:', e.message);
}

try {
    const rawMatch = zlib.inflateRawSync(data);
    fs.writeFileSync('output_raw.xml', rawMatch);
    console.log('Success with inflateRawSync');
} catch (e) {
    console.log('Failed with inflateRawSync:', e.message);
}
