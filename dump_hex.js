
const fs = require('fs');
const buf = fs.readFileSync(process.argv[2]);
console.log('Hex:', buf.subarray(0, 100).toString('hex'));
console.log('ASCII:', buf.subarray(0, 100).toString('utf8'));
