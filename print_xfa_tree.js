
const fs = require('fs');
const content = fs.readFileSync('xfa_raw_template.xml', 'utf8');

function findClosingBracket(str, startPos) {
    let depth = 0;
    for (let i = startPos; i < str.length; i++) {
        if (str[i] === '<' && str[i + 1] !== '/') depth++;
        if (str[i] === '<' && str[i + 1] === '/') depth--;
        if (depth === 0) return i;
    }
    return -1;
}

// Very basic recursive parser for subforms
function parseSubforms(xml, indent = '') {
    const subformRegex = /<subform\s+[^>]*name="([^"]+)"/g;
    let match;
    while ((match = subformRegex.exec(xml)) !== null) {
        const name = match[1];
        console.log(indent + 'Subform: ' + name);

        // Find fields in this subform (naive check)
        // We'll just look for the next subform start to bound our search
        const nextSubformIndex = xml.indexOf('<subform', subformRegex.lastIndex);
        const searchEnd = nextSubformIndex === -1 ? xml.length : nextSubformIndex;
        const subformContent = xml.substring(subformRegex.lastIndex, searchEnd);

        const fieldRegex = /<field\s+[^>]*name="([^"]+)"/g;
        let fMatch;
        while ((fMatch = fieldRegex.exec(subformContent)) !== null) {
            console.log(indent + '  Field: ' + fMatch[1]);
        }
    }
}

parseSubforms(content);
