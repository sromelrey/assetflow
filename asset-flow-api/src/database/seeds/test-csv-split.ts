const fs = require('fs');
const path = require('path');

function analyzeCSV() {
  const csvPath = path.join(process.cwd(), '..', 'assets.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('File not found at:', csvPath);
    console.log('Current working directory:', process.cwd());
    return;
  }

  const buffer = fs.readFileSync(csvPath);
  const content = buffer.toString('utf8');
  const lines = content.split(/\r?\n/);
  const firstLine = lines[0];
  const secondLine = lines[1];

  console.log('--- TEST 1: Raw First Line (JSON) ---');
  console.log(JSON.stringify(firstLine));

  console.log('\n--- TEST 2: Splits ---');
  console.log('Comma split count:', firstLine.split(',').length);
  console.log('Tab split count:', firstLine.split('\t').length);
  console.log('Semicolon split count:', firstLine.split(';').length);

  console.log('\n--- TEST 3: Header Mapping Check (COMMA) ---');
  const commaSplit = firstLine
    .split(',')
    .map((h) => h.replace(/^"|"$/g, '').trim());
  console.log('First 10 headers if comma-split:', commaSplit.slice(0, 10));

  console.log('\n--- TEST 4: Header Mapping Check (TAB) ---');
  const tabSplit = firstLine
    .split('\t')
    .map((h) => h.replace(/^"|"$/g, '').trim());
  console.log('First 10 headers if tab-split:', tabSplit.slice(0, 10));

  console.log('\n--- TEST 5: Data Row Check (COMMA) ---');

  // Check if the "IT ASSET NO" is duplicated or weird
  const itAssetIndices: number[] = [];
  commaSplit.forEach((h, i) => {
    if (h.includes('IT ASSET NO')) itAssetIndices.push(i);
  });
  console.log('Indices for "IT ASSET NO":', itAssetIndices);

  console.log('\n--- TEST 4: Data Row Check ---');
  if (secondLine) {
    const dataSplit = secondLine
      .split(',')
      .map((v) => v.replace(/^"|"$/g, '').trim());
    console.log(
      'First row value for category if comma-split (index 8?):',
      dataSplit[8] || 'N/A',
    );
    console.log('First row columns count:', dataSplit.length);
  }
}

analyzeCSV();
