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

async function importHierarchy() {
  console.log('Starting Phase 2: Hierarchy & Categories Import...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const categoryRepo = dataSource.getRepository(Category);
  const siteRepo = dataSource.getRepository(Site);
  const buildingRepo = dataSource.getRepository(Building);
  const floorRepo = dataSource.getRepository(Floor);
  const divisionRepo = dataSource.getRepository(Division);
  const departmentRepo = dataSource.getRepository(Department);
  const unitRepo = dataSource.getRepository(Unit);

  const csvPath = path.join(process.cwd(), '..', 'assets-clean.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('Cleaned CSV not found!');
    process.exit(1);
  }

  const results: any[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err));
  });

  console.log(`Processing ${results.length} rows for hierarchy...`);

  let categoryCount = 0;
  let hierarchyCount = 0;

  for (let i = 0; i < results.length; i++) {
    const row = results[i];

    try {
      // 1. Categories
      const catName = row['CATEGORY']?.trim() || 'Uncategorized';
      let category = await categoryRepo.findOneBy({ name: catName });
      if (!category) {
        await categoryRepo.save(categoryRepo.create({ name: catName }));
        categoryCount++;
      }

      // 2. Hierarchy Chain
      const siteName = row['SITE ADDRESS']?.trim() || 'Unknown Site';
      const bldgName = row['BLDG. LOCATION']?.trim() || 'Unknown Building';
      const floorName = row['FLOOR']?.trim() || 'Unknown Floor';
      const divName = row['DIVISION']?.trim() || 'Unknown Division';
      const deptName = row['DEPARTMENT']?.trim() || 'Unknown Department';
      const unitName = row['UNIT']?.trim() || 'Unknown Unit';

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
        hierarchyCount++;
      }

      if ((i + 1) % 500 === 0) {
        console.log(`Processed ${i + 1}/${results.length} rows...`);
      }
    } catch (error) {
      console.error(`Error at row ${i + 1}:`, error.message);
    }
  }

  console.log('\n--- Phase 2 Complete ---');
  console.log(`New Categories: ${categoryCount}`);
  console.log(`New Units (Hierarchy Paths): ${hierarchyCount}`);

  await app.close();
  process.exit(0);
}

importHierarchy().catch(console.error);
