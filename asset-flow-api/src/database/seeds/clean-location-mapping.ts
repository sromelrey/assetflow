import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as path from 'path';

// Patterns that indicate the CSV had junk data shifted into a location field
const NOISE_PATTERNS = [
  /^WIN\s?\d+/i,
  /windows\s?\d+/i,
  /ANDROID/i,
  /^FJC|^FGL|^FCW|^JFC/, // serial numbers in site field
  /^[A-Z0-9]{8,},[A-Z0-9]+/, // comma-separated serial numbers
];

function isNoise(value: string): boolean {
  return NOISE_PATTERNS.some((pattern) => pattern.test(value ?? ''));
}

async function cleanLocationMapping() {
  const inputPath = path.join(process.cwd(), '..', 'location-mapping.csv');
  const outputPath = path.join(process.cwd(), '..', 'location-mapping.csv');
  const results: any[] = [];

  console.log('Reading location-mapping.csv...');

  await new Promise((resolve) => {
    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(true));
  });

  let removed = 0;
  const clean: any[] = [];

  for (const row of results) {
    const fieldsToCheck = [
      row['OriginalSite'],
      row['OriginalBuilding'],
      row['OriginalFloor'],
      row['OriginalUnit'],
      row['CorrectedSite'],
      row['CorrectedBuilding'],
      row['CorrectedFloor'],
      row['CorrectedUnit'],
    ];

    if (fieldsToCheck.some(isNoise)) {
      console.log(
        `  REMOVING: ${row['OriginalSite']} -> ${row['OriginalBuilding']} -> ${row['OriginalUnit']}`,
      );
      removed++;
    } else {
      clean.push(row);
    }
  }

  // Write back
  const header =
    'OriginalSite,OriginalBuilding,OriginalFloor,OriginalDivision,OriginalDepartment,OriginalUnit,CorrectedSite,CorrectedBuilding,CorrectedFloor,CorrectedDivision,CorrectedDepartment,CorrectedUnit\n';
  const writeStream = fs.createWriteStream(outputPath);
  writeStream.write(header);

  for (const row of clean) {
    const line = [
      row['OriginalSite'],
      row['OriginalBuilding'],
      row['OriginalFloor'],
      row['OriginalDivision'],
      row['OriginalDepartment'],
      row['OriginalUnit'],
      row['CorrectedSite'],
      row['CorrectedBuilding'],
      row['CorrectedFloor'],
      row['CorrectedDivision'],
      row['CorrectedDepartment'],
      row['CorrectedUnit'],
    ]
      .map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)
      .join(',');
    writeStream.write(line + '\n');
  }
  writeStream.end();

  console.log(
    `\nDone! Removed ${removed} noisy rows. ${clean.length} clean rows remaining.`,
  );
}

cleanLocationMapping().catch(console.error);
