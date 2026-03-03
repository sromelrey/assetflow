import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const counts = await Promise.all([
    dataSource.query('SELECT COUNT(*) as count FROM asset'),
    dataSource.query('SELECT COUNT(*) as count FROM asset_details'),
    dataSource.query('SELECT COUNT(*) as count FROM category'),
    dataSource.query('SELECT COUNT(*) as count FROM site'),
    dataSource.query('SELECT COUNT(*) as count FROM unit'),
    dataSource.query('SELECT COUNT(*) as count FROM employee'),
  ]);

  console.log('=== DATABASE REPOSITORY COUNTS ===');
  console.log('Assets:', counts[0][0].count);
  console.log('Asset Details:', counts[1][0].count);
  console.log('Categories:', counts[2][0].count);
  console.log('Sites:', counts[3][0].count);
  console.log('Units:', counts[4][0].count);
  console.log('Employees:', counts[5][0].count);

  const sampleCategories = await dataSource.query('SELECT name FROM category LIMIT 5');
  console.log('Sample Categories:', sampleCategories);

  const sampleAssets = await dataSource.query('SELECT name FROM asset LIMIT 5');
  console.log('Sample Assets:', sampleAssets);

  await app.close();
}

bootstrap().catch(err => {
  console.error('Check script failed:', err);
  process.exit(1);
});
