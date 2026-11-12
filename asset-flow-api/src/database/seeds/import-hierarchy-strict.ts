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

const VALID_SITES = ['CEBU', 'MANDAUE', 'MEDMALL'];

async function importHierarchyStrict() {
  console.log('Starting Phase 2: Strict Hierarchy Import...');
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
  const results: any[] = [];

  await new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true));
  });

  console.log(`Processing ${results.length} rows...`);

  // Ensure a "N/A" or "UNALLOCATED" fallback exists for each level
  const getUnallocatedSite = async () => {
    let site = await siteRepo.findOneBy({ name: 'UNALLOCATED' });
    if (!site)
      site = await siteRepo.save(siteRepo.create({ name: 'UNALLOCATED' }));
    return site;
  };

  for (let i = 0; i < results.length; i++) {
    const row = results[i];

    try {
      // 1. Categories - Clean out noise
      let catName = row['CATEGORY']?.trim() || 'UNCATEGORIZED';
      if (
        catName.length > 50 ||
        catName.includes(',') ||
        /^\d+$/.test(catName)
      ) {
        catName = 'UNCATEGORIZED';
      }
      let category = await categoryRepo.findOneBy({ name: catName });
      if (!category)
        await categoryRepo.save(categoryRepo.create({ name: catName }));

      // 2. Hierarchy - Strict Site Mapping
      let siteName = row['SITE ADDRESS']?.trim()?.toUpperCase() || '';

      // Auto-fix sites based on keywords
      if (siteName.includes('MANDAUE')) siteName = 'MANDAUE';
      else if (siteName.includes('CEBU')) siteName = 'CEBU';
      else if (siteName.includes('MEDMALL')) siteName = 'MEDMALL';

      // Fallback for clearly wrong data (noise)
      if (!VALID_SITES.includes(siteName)) {
        // Double check building name for hints
        const bldgHint = row['BLDG. LOCATION']?.trim()?.toUpperCase() || '';
        if (bldgHint.includes('MANDAUE')) siteName = 'MANDAUE';
        else if (bldgHint.includes('CEBU')) siteName = 'CEBU';
        else siteName = 'UNALLOCATED';
      }

      let bldgName =
        row['BLDG. LOCATION']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() ||
        'N/A';
      if (bldgName.toUpperCase() === 'N/A' || bldgName === '')
        bldgName = 'UNALLOCATED';

      let floorName =
        row['FLOOR']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
      if (floorName.toUpperCase() === 'N/A' || floorName === '')
        floorName = 'UNALLOCATED';

      let divName =
        row['DIVISION']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
      if (divName.toUpperCase() === 'N/A' || divName === '')
        divName = 'UNALLOCATED';

      let deptName =
        row['DEPARTMENT']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() ||
        'N/A';
      if (deptName.toUpperCase() === 'N/A' || deptName === '')
        deptName = 'UNALLOCATED';

      let unitName =
        row['UNIT']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
      if (unitName.toUpperCase() === 'N/A' || unitName === '')
        unitName = 'UNALLOCATED';

      // Level 1: Site
      let site = await siteRepo.findOneBy({ name: siteName });
      if (!site)
        site = await siteRepo.save(siteRepo.create({ name: siteName }));

      // Level 2: Building
      let building = await buildingRepo.findOneBy({
        name: bldgName,
        site: { id: site.id },
      });
      if (!building)
        building = await buildingRepo.save(
          buildingRepo.create({ name: bldgName, site }),
        );

      // Level 3: Floor
      let floor = await floorRepo.findOneBy({
        floorNumber: floorName,
        building: { id: building.id },
      });
      if (!floor)
        floor = await floorRepo.save(
          floorRepo.create({ floorNumber: floorName, building }),
        );

      // Level 4: Division
      let division = await divisionRepo.findOneBy({
        name: divName,
        floor: { id: floor.id },
      });
      if (!division)
        division = await divisionRepo.save(
          divisionRepo.create({ name: divName, floor, status: 'active' }),
        );

      // Level 5: Department
      let department = await departmentRepo.findOneBy({
        name: deptName,
        divisionId: { id: division.id },
      });
      if (!department)
        department = await departmentRepo.save(
          departmentRepo.create({ name: deptName, divisionId: division }),
        );

      // Level 6: Unit
      let unit = await unitRepo.findOneBy({
        name: unitName,
        departmentId: { id: department.id },
      });
      if (!unit)
        await unitRepo.save(
          unitRepo.create({ name: unitName, departmentId: department }),
        );

      if ((i + 1) % 1000 === 0) {
        console.log(`Processed ${i + 1}/${results.length} rows...`);
      }
    } catch (error) {
      console.error(`Error at row ${i + 1}:`, error.message);
    }
  }

  console.log('\n--- Phase 2 (Strict) Complete ---');
  await app.close();
  process.exit(0);
}

importHierarchyStrict().catch(console.error);
