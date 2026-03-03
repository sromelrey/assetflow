import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as path from 'path';

import { Asset } from '@/entities/asset.entity';
import { AssetDetails } from '@/entities/asset-details.entity';
import { Category } from '@/entities/category.entity';
import { Employee } from '@/entities/employee.entity';
import { Site } from '@/entities/site.entity';
import { Building } from '@/entities/building.entity';
import { Floor } from '@/entities/floor.entity';
import { Division } from '@/entities/division.entity';
import { Department } from '@/entities/department.entity';
import { Unit } from '@/entities/unit.entity';
import { AssetStatus } from '@/types/enums';

async function bootstrap() {
  console.log('Starting Asset Import Process...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  if (!dataSource.isInitialized) {
    console.error('DataSource is not initialized!');
    process.exit(1);
  }

  const assetRepo = dataSource.getRepository(Asset);
  const assetDetailsRepo = dataSource.getRepository(AssetDetails);
  const categoryRepo = dataSource.getRepository(Category);
  const employeeRepo = dataSource.getRepository(Employee);
  
  const siteRepo = dataSource.getRepository(Site);
  const buildingRepo = dataSource.getRepository(Building);
  const floorRepo = dataSource.getRepository(Floor);
  const divisionRepo = dataSource.getRepository(Division);
  const departmentRepo = dataSource.getRepository(Department);
  const unitRepo = dataSource.getRepository(Unit);

  const results: any[] = [];
  const csvPath = path.join(process.cwd(), '..', 'assets.csv');

  console.log(`Reading CSV from: ${csvPath}`);
  
  if (!fs.existsSync(csvPath)) {
    console.error('assets.csv not found in the root directory!');
    process.exit(1);
  }

  // Parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err));
  });

  console.log(`Found ${results.length} rows to process.`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    try {
      // 1. Resolve Hierarchy
      let siteName = row['SITE ADDRESS']?.trim();
      let bldgName = row['BLDG. LOCATION']?.trim();
      let divName = row['DIVISION']?.trim();
      let deptName = row['DEPARTMENT']?.trim();
      let floorName = row['FLOOR']?.trim();
      let unitName = row['UNIT']?.trim();

      // Ensure fallbacks for hierarchy components to prevent null constraint errors if they aren't provided
      siteName = siteName || 'Unknown Site';
      bldgName = bldgName || 'Unknown Building';
      floorName = floorName || 'Unknown Floor';
      divName = divName || 'Unknown Division';
      deptName = deptName || 'Unknown Department';
      unitName = unitName || 'Unknown Unit';

      let site = await siteRepo.findOneBy({ name: siteName });
      if (!site) site = await siteRepo.save(siteRepo.create({ name: siteName }));

      let building = await buildingRepo.findOneBy({ name: bldgName, site: { id: site.id } });
      if (!building) building = await buildingRepo.save(buildingRepo.create({ name: bldgName, site }));

      let floor = await floorRepo.findOneBy({ floorNumber: floorName, building: { id: building.id } });
      if (!floor) floor = await floorRepo.save(floorRepo.create({ floorNumber: floorName, building }));

      let division = await divisionRepo.findOneBy({ name: divName, floor: { id: floor.id } });
      if (!division) division = await divisionRepo.save(divisionRepo.create({ name: divName, floor, status: 'active' }));

      let department = await departmentRepo.findOneBy({ name: deptName, divisionId: { id: division.id } });
      if (!department) department = await departmentRepo.save(departmentRepo.create({ name: deptName, divisionId: division }));

      let unit = await unitRepo.findOneBy({ name: unitName, departmentId: { id: department.id } });
      if (!unit) unit = await unitRepo.save(unitRepo.create({ name: unitName, departmentId: department }));

      // 2. Resolve Category
      const catName = row['CATEGORY']?.trim() || 'Uncategorized';
      let category = await categoryRepo.findOneBy({ name: catName });
      if (!category) category = await categoryRepo.save(categoryRepo.create({ name: catName }));

      // 3. Resolve Custodian (Employee)
      const custodianName = row['CUSTODIAN']?.trim();
      let employee: Employee | null = null;
      if (custodianName) {
        // Try fuzzy find by name parts
        const parts = custodianName.split(' ');
        const firstName = parts[0];
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Unknown';
        
        employee = await employeeRepo.createQueryBuilder('employee')
          .where('employee.firstName ILIKE :firstName', { firstName: `%${firstName}%` })
          .andWhere('employee.lastName ILIKE :lastName', { lastName: `%${lastName}%` })
          .getOne();
          
        if (!employee) {
          employee = await employeeRepo.save(employeeRepo.create({
            firstName,
            lastName,
            status: 'active'
          }));
        }
      }

      // 4. Map Status
      const rawStatus = row['STATUS']?.trim()?.toUpperCase() || '';
      let status = AssetStatus.ACTIVE;
      if (rawStatus === 'DEPLOYED') status = AssetStatus.DEPLOYED;
      else if (rawStatus === 'DECOMMISSIONED' || row['DATE DECOMMISSIONED']) status = AssetStatus.DECOMMISSIONED;
      else if (rawStatus.includes('REPAIR')) status = AssetStatus.FOR_REPAIR;
      else if (rawStatus.includes('STORAGE')) status = AssetStatus.IN_STORAGE;

      // 5. Parse Date
      let purchaseDate: Date | undefined = undefined;
      if (row['DATE DEPLOYED']) {
        const d = new Date(row['DATE DEPLOYED']);
        if (!isNaN(d.getTime())) purchaseDate = d;
      }

      // 6. Basic Asset Info
      const assetNo = row['IT ASSET NO']?.trim();
      const serialNo = row['SERIAL NUMBER']?.trim() || null; // null if empty for unique constraint
      const name = assetNo || `Asset ${i}`;

      let asset = await assetRepo.findOneBy({ assetNo });
      if (!asset) {
        asset = assetRepo.create({
          name,
          assetNo,
          serialNo: serialNo !== '' ? serialNo : null, // Handle empty strings as null to prevent unique constraint violation on empty strings
          status,
          purchaseDate,
          unit,
          category,
        });
        asset = await assetRepo.save(asset);
      }

      // 7. Asset Details & JSONB Metadata
      const metadata: Record<string, any> = {
        updatedAv: row['UPDATED AV']?.trim(),
        rapid7: row['RAPID 7']?.trim(),
        lastPhysicalCountDate: row['LAST PHYSICAL COUNT DATE']?.trim(),
        lastPhysicalCountCheckedBy: row['LAST PHYSICAL COUNT CHECKED BY']?.trim(),
        financeFixedAssetNo: row['FINANCE FIXED ASSET NO.']?.trim(),
        assetTaggedBy: row['ASSET TAGGED BY:']?.trim(),
        // Save the raw text hierarchy just to be safe
        rawHierarchy: {
          site: row['SITE ADDRESS'],
          building: row['BLDG. LOCATION'],
          floor: row['FLOOR'],
          division: row['DIVISION'],
          department: row['DEPARTMENT'],
          unit: row['UNIT']
        }
      };

      if (employee) {
        metadata.custodianId = employee.id;
        metadata.custodianName = custodianName;
      }

      let assetDetails = await assetDetailsRepo.findOneBy({ assetId: { id: asset.id } });
      if (!assetDetails) {
        assetDetails = assetDetailsRepo.create({
          brand: row['BRAND']?.trim(),
          model: row['MODEL']?.trim(),
          ipAddress: row['IP ADDRESS']?.trim(),
          computerName: row['COMPUTER NAME']?.trim(),
          operatingSystem: row['OPERATING SYSTEM (IF ANY)']?.trim() || row['OPERATING SYSTEM']?.trim(),
          processor: row['PROCESSOR']?.trim(),
          memory: row['MEMORY']?.trim(),
          storage: row['STORAGE CAPACITY']?.trim() || row['STORAGE']?.trim(),
          remarks: row['REMARKS']?.trim(),
          poNumber: row['P.O. NUMBER']?.trim(),
          imei: row['IMEI NO']?.trim(),
          metadata,
          assetId: asset,
        });
        await assetDetailsRepo.save(assetDetails);
      }
      
      successCount++;
      if (successCount % 50 === 0) {
        console.log(`Processed ${successCount}/${results.length} rows...`);
      }
    } catch (error) {
      console.error(`Error processing row ${i + 1}`, error);
      errorCount++;
    }
  }

  console.log(`\nImport Complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  await app.close();
  process.exit(0);
}

bootstrap();
