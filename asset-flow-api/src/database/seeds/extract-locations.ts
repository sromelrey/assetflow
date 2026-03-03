import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as path from 'path';

async function extractLocations() {
  const csvPath = path.join(process.cwd(), '..', 'assets-clean.csv');
  const outputPath = path.join(process.cwd(), '..', 'location-mapping.csv');
  const results: any[] = [];

  if (!fs.existsSync(csvPath)) {
    console.error('Cleaned CSV not found at:', csvPath);
    process.exit(1);
  }

  console.log('Extracting unique location paths...');

  await new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true));
  });

  const uniqueLocations = new Map<string, any>();

  results.forEach(row => {
    const site = row['SITE ADDRESS']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
    const bldg = row['BLDG. LOCATION']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
    const floor = row['FLOOR']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
    const division = row['DIVISION']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
    const dept = row['DEPARTMENT']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
    const unit = row['UNIT']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';

    const key = `${site}|${bldg}|${floor}|${division}|${dept}|${unit}`;
    
    if (!uniqueLocations.has(key)) {
      uniqueLocations.set(key, { site, bldg, floor, division, dept, unit });
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  // Write Headers
  writeStream.write('OriginalSite,OriginalBuilding,OriginalFloor,OriginalDivision,OriginalDepartment,OriginalUnit,CorrectedSite,CorrectedBuilding,CorrectedFloor,CorrectedDivision,CorrectedDepartment,CorrectedUnit\n');

  // Write Data row by row, with Corrected columns mirroring Original by default.
  // Note: we wrap them in quotes to handle any internal commas
  for (const loc of uniqueLocations.values()) {
    const line = `"${loc.site}","${loc.bldg}","${loc.floor}","${loc.division}","${loc.dept}","${loc.unit}",` + 
                 `"${loc.site}","${loc.bldg}","${loc.floor}","${loc.division}","${loc.dept}","${loc.unit}"`;
    writeStream.write(line + '\n');
  }

  writeStream.end();

  console.log(`\nExtraction Complete!`);
  console.log(`Found ${uniqueLocations.size} unique location combinations.`);
  console.log(`Saved mapping file to: ${outputPath}`);
  console.log(`\nNEXT STEP: Open ${outputPath} in Excel/CSV Editor, change the values in the 'Corrected' columns, then save the file.`);
}

extractLocations().catch(console.error);
