import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';

async function cleanupHierarchy() {
  console.log('Cleaning up hierarchy tables...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Order is important due to foreign key constraints
  const tables = [
    'unit',
    'department',
    'division',
    'floor',
    'building',
    'site',
    'category',
  ];

  for (const table of tables) {
    console.log(`Clearing table: ${table}`);
    // Using TRUNCATE with RESTART IDENTITY and CASCADE to reset IDs and handle dependencies
    await dataSource.query(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`,
    );
  }

  console.log(
    '\nCleanup Complete! All hierarchy and category tables are empty.',
  );
  await app.close();
  process.exit(0);
}

cleanupHierarchy().catch(console.error);
