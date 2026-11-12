import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as path from 'path';

async function analyzeHierarchy() {
  const csvPath = path.join(process.cwd(), '..', 'assets-clean.csv');
  const results: any[] = [];

  if (!fs.existsSync(csvPath)) {
    console.error('Cleaned CSV not found!');
    process.exit(1);
  }

  await new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true));
  });

  console.log(
    `Analyzing ${results.length} rows for hierarchy combinations...\n`,
  );

  const sites = new Set();
  const buildings = new Set();
  const combinations = new Map();

  results.forEach((row) => {
    const site = row['SITE ADDRESS']?.trim() || 'BLANK';
    const bldg = row['BLDG. LOCATION']?.trim() || 'BLANK';
    const floor = row['FLOOR']?.trim() || 'BLANK';

    sites.add(site);
    buildings.add(bldg);

    const key = `${site} -> ${bldg} -> ${floor}`;
    combinations.set(key, (combinations.get(key) || 0) + 1);
  });

  console.log('--- UNIQUE SITES ---');
  console.log(Array.from(sites));

  console.log(
    '\n--- TOP 20 HIERARCHY COMBINATIONS (Site -> Bldg -> Floor) ---',
  );
  const sorted = Array.from(combinations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  sorted.forEach(([comb, count]) => {
    console.log(`${comb}: ${count} assets`);
  });

  console.log('\n--- BLANK CHECK ---');
  console.log(
    'Rows with BLANK Site:',
    results.filter((r) => !r['SITE ADDRESS']?.trim()).length,
  );
  console.log(
    'Rows with BLANK Building:',
    results.filter((r) => !r['BLDG. LOCATION']?.trim()).length,
  );
}

analyzeHierarchy().catch(console.error);
