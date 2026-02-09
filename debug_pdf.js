const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Keys:', Object.keys(pdf));
console.log('Is default a function?', typeof pdf.default === 'function');
console.log('Direct call:', typeof pdf === 'function');
