import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as path from 'path';

import { Category } from '@/entities/category.entity';
import { Site } from '@/entities/site.entity';
import { Building } from '@/entities/building.entity';
import { Floor } from '@/entities/floor.entity';
import { Division } from '@/entities/division.entity';
import { Department } from '@/entities/department.entity';
import { Unit } from '@/entities/unit.entity';

async function importHierarchyMapped() {
  console.log('Starting Phase 3: Mapped Hierarchy Import...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const siteRepo = dataSource.getRepository(Site);
  const buildingRepo = dataSource.getRepository(Building);
  const floorRepo = dataSource.getRepository(Floor);
  const divisionRepo = dataSource.getRepository(Division);
  const departmentRepo = dataSource.getRepository(Department);
  const unitRepo = dataSource.getRepository(Unit);
  const categoryRepo = dataSource.getRepository(Category);

  const mappingPath = path.join(process.cwd(), '..', 'location-mapping.csv');
  const rows: any[] = [];

  await new Promise((resolve) => {
    fs.createReadStream(mappingPath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(true));
  });

  console.log(
    `Processing ${rows.length} unique location combinations from mapping...`,
  );

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Read from Corrected columns (what the user cleaned)
    const siteName = row['CorrectedSite']?.trim() || 'UNALLOCATED';
    const bldgName = row['CorrectedBuilding']?.trim() || 'UNALLOCATED';
    const floorName = row['CorrectedFloor']?.trim() || 'UNALLOCATED';
    const divName = row['CorrectedDivision']?.trim() || 'UNALLOCATED';
    const deptName = row['CorrectedDepartment']?.trim() || 'UNALLOCATED';
    const unitName = row['CorrectedUnit']?.trim() || 'UNALLOCATED';

    // Skip completely empty or obviously bad rows
    if (siteName === 'N/A' && bldgName === 'N/A' && unitName === 'N/A') {
      skipped++;
      continue;
    }

    try {
      let site = await siteRepo.findOneBy({ name: siteName });
      if (!site)
        site = await siteRepo.save(siteRepo.create({ name: siteName }));

      let building = await buildingRepo.findOneBy({
        name: bldgName,
        site: { id: site.id },
      });
      if (!building)
        building = await buildingRepo.save(
          buildingRepo.create({ name: bldgName, site }),
        );

      let floor = await floorRepo.findOneBy({
        floorNumber: floorName,
        building: { id: building.id },
      });
      if (!floor)
        floor = await floorRepo.save(
          floorRepo.create({ floorNumber: floorName, building }),
        );

      let division = await divisionRepo.findOneBy({
        name: divName,
        floor: { id: floor.id },
      });
      if (!division)
        division = await divisionRepo.save(
          divisionRepo.create({ name: divName, floor, status: 'active' }),
        );

      let department = await departmentRepo.findOneBy({
        name: deptName,
        divisionId: { id: division.id },
      });
      if (!department)
        department = await departmentRepo.save(
          departmentRepo.create({ name: deptName, divisionId: division }),
        );

      let unit = await unitRepo.findOneBy({
        name: unitName,
        departmentId: { id: department.id },
      });
      if (!unit) {
        await unitRepo.save(
          unitRepo.create({ name: unitName, departmentId: department }),
        );
        created++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`  Processed ${i + 1}/${rows.length} rows...`);
      }
    } catch (err) {
      console.error(`  Error at row ${i + 1}: ${err.message}`);
    }
  }

  // Also seed Categories from the clean CSV
  console.log('\nSeeding Categories from assets-clean.csv...');
  const csvPath = path.join(process.cwd(), '..', 'assets-clean.csv');
  const assetRows: any[] = [];
  await new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (r) => assetRows.push(r))
      .on('end', () => resolve(true));
  });

  const categoryNames = new Set<string>();
  assetRows.forEach((r) => {
    let cat = r['CATEGORY']?.trim();
    if (
      cat &&
      cat.length <= 100 &&
      !cat.includes(',') &&
      !/^\d+$/.test(cat) &&
      cat.toUpperCase() !== 'N/A'
    ) {
      categoryNames.add(cat);
    }
  });

  let categoryCreated = 0;
  for (const name of categoryNames) {
    const existing = await categoryRepo.findOneBy({ name });
    if (!existing) {
      await categoryRepo.save(categoryRepo.create({ name }));
      categoryCreated++;
    }
  }

  console.log(`\n--- Phase 3 Complete ---`);
  console.log(`New Units created: ${created}`);
  console.log(`Skipped (all N/A): ${skipped}`);
  console.log(`New Categories created: ${categoryCreated}`);

  await app.close();
  process.exit(0);
}

importHierarchyMapped().catch(console.error);
