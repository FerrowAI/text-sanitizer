const { sanitize, detectHomoglyphs, report } = require('../dist/index');

console.log('=== text-sanitizer demo ===\n');

// Test 1: Control char and zero-width removal
const dirty = 'Hello\x00world​‌\nTest';
const clean = sanitize(dirty);
console.log('Dirty text (has null + zero-width):', dirty.length, 'chars');
console.log('Cleaned:', clean.length, 'chars');
console.log('Cleaned text:', JSON.stringify(clean));

// Test 2: Homoglyph detection
const cyrillic = 'ПривEт'; // Mix of Cyrillic and Latin
const glyphFindings = detectHomoglyphs(cyrillic);
console.log('\nHomoglyph detection in "ПривEт":', glyphFindings.length, 'found');

// Test 3: Report
const stats = report(dirty);
console.log('\nReport on dirty text:', stats);

// Test 4: Sanitize with various options
const sanitized = sanitize('Text  with   spaces', { collapseWhitespace: true });
console.log('Collapsed whitespace:', JSON.stringify(sanitized));

console.log('✓ Demo complete');
