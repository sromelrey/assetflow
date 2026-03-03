import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as path from 'path';

async function bootstrap() {
  const csvPath = path.join(process.cwd(), '..', 'assets.csv');
  const results: any[] = [];

  console.log(`Analyzing CSV at: ${csvPath}`);

  await new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true));
  });

  if (results.length === 0) {
    console.error('No rows found in CSV!');
    process.exit(1);
  }

  const firstRow = results[0];
  console.log('--- CSV HEADERS DETECTED BY PARSER ---');
  console.log(Object.keys(firstRow));

  const uniqueCategories = new Set();
  const uniqueSites = new Set();
  const statusCounts: Record<string, number> = {};

  results.forEach(row => {
    const cat = row['CATEGORY'] || row['category'] || 'MISSING';
    uniqueCategories.add(cat);
    
    const site = row['SITE ADDRESS'] || row['site address'] || 'MISSING';
    uniqueSites.add(site);

    const status = row['STATUS'] || 'MISSING';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  console.log('\n--- DATA ANALYSIS ---');
  console.log('Total Rows:', results.length);
  console.log('Unique Categories Found:', uniqueCategories.size);
  console.log('Unique Sites Found:', uniqueSites.size);
  console.log('Status Breakdown:', statusCounts);
  
  console.log('\nFirst 10 Categories:', Array.from(uniqueCategories).slice(0, 10));
}

bootstrap().catch(console.error);
