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
import { Unit } from '@/entities/unit.entity';
import { AssetStatus } from '@/types/enums';

async function importAssetsFinal() {
  console.log('Starting Phase 3: Final Assets Import...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const assetRepo = dataSource.getRepository(Asset);
  const assetDetailsRepo = dataSource.getRepository(AssetDetails);
  const categoryRepo = dataSource.getRepository(Category);
  const employeeRepo = dataSource.getRepository(Employee);
  const unitRepo = dataSource.getRepository(Unit);

  const csvPath = path.join(process.cwd(), '..', 'assets-clean.csv');
  const results: any[] = [];

  await new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true));
  });

  console.log(`Processing ${results.length} rows for Assets...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    
    try {
      // 1. Fetch relations established in Phase 2
      let catName = row['CATEGORY']?.trim() || 'UNCATEGORIZED';
      if (catName.length > 50 || catName.includes(',') || /^\d+$/.test(catName)) catName = 'UNCATEGORIZED';
      const category = await categoryRepo.findOneBy({ name: catName });

      let unitName = row['UNIT']?.replace(/\t/g, '')?.replace(/"/g, '')?.trim() || 'N/A';
      if (unitName.toUpperCase() === 'N/A' || unitName === '') unitName = 'UNALLOCATED';
      // Just find the first unit matching the name (Phase 2 ensured they exist uniquely per department chain)
      const unit = await unitRepo.findOneBy({ name: unitName });

      // 2. Resolve Custodian
      const custodianName = row['CUSTODIAN']?.trim();
      let employee: Employee | null = null;
      if (custodianName && custodianName.toLowerCase() !== 'n/a' && custodianName !== '') {
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

      // 3. Map Status
      const rawStatus = row['STATUS']?.trim()?.toUpperCase() || '';
      let status = AssetStatus.ACTIVE;
      if (rawStatus === 'DEPLOYED') status = AssetStatus.DEPLOYED;
      else if (rawStatus === 'DECOMMISSIONED' || row['DATE DECOMMISSIONED']) status = AssetStatus.DECOMMISSIONED;
      else if (rawStatus.includes('REPAIR')) status = AssetStatus.FOR_REPAIR;
      else if (rawStatus.includes('STORAGE')) status = AssetStatus.IN_STORAGE;

      // 4. Parse Date
      let purchaseDate: Date | undefined = undefined;
      if (row['DATE DEPLOYED']) {
        const d = new Date(row['DATE DEPLOYED']);
        if (!isNaN(d.getTime())) purchaseDate = d;
      }

      // 5. Basic Asset Info
      const assetNo = row['IT ASSET NO']?.trim();
      if (!assetNo) {
          errorCount++;
          continue; // Cannot import without asset number based on our schema requirement
      }
      
      const serialNo = row['SERIAL NUMBER']?.trim() || null;
      const name = assetNo;

      let asset = await assetRepo.findOneBy({ assetNo });
      if (!asset) {
        const newAsset = assetRepo.create();
        newAsset.name = name;
        newAsset.assetNo = assetNo;
        newAsset.serialNo = (serialNo && serialNo !== '') ? serialNo : undefined;
        newAsset.status = status;
        if (purchaseDate) newAsset.purchaseDate = purchaseDate;
        if (unit) newAsset.unit = unit;
        if (category) newAsset.category = category;
        asset = await assetRepo.save(newAsset);
      }

      // 6. Asset Details & Metadata
      const metadata: Record<string, any> = {
        updatedAv: row['UPDATED AV']?.trim(),
        rapid7: row['RAPID 7']?.trim(),
        lastPhysicalCountDate: row['LAST PHYSICAL COUNT DATE']?.trim(),
        lastPhysicalCountCheckedBy: row['LAST PHYSICAL COUNT CHECKED BY']?.trim(),
        financeFixedAssetNo: row['FINANCE FIXED ASSET NO.']?.trim(),
        assetTaggedBy: row['ASSET TAGGED BY:']?.trim(),
        rawLocationTags: {
          site: row['SITE ADDRESS']?.trim(),
          building: row['BLDG. LOCATION']?.trim(),
          floor: row['FLOOR']?.trim(),
          division: row['DIVISION']?.trim(),
          department: row['DEPARTMENT']?.trim(),
          unit: row['UNIT']?.trim()
        }
      };

      if (employee) {
        metadata.custodianId = employee.id;
        metadata.custodianName = custodianName;
      }

      let assetDetails = await assetDetailsRepo.findOneBy({ assetId: { id: asset.id } });
      if (!assetDetails) {
        const details = assetDetailsRepo.create();
        details.brand = row['BRAND']?.trim() || undefined;
        details.model = row['MODEL']?.trim() || undefined;
        details.ipAddress = row['IP ADDRESS']?.trim() || undefined;
        details.computerName = row['COMPUTER NAME']?.trim() || undefined;
        details.operatingSystem = row['OPERATING SYSTEM (IF ANY)']?.trim() || row['OPERATING SYSTEM']?.trim() || undefined;
        details.processor = row['PROCESSOR']?.trim() || undefined;
        details.memory = row['MEMORY']?.trim() || undefined;
        details.storage = row['STORAGE CAPACITY']?.trim() || row['STORAGE']?.trim() || undefined;
        details.remarks = row['REMARKS']?.trim() || undefined;
        details.poNumber = row['P.O. NUMBER']?.trim() || undefined;
        details.imei = row['IMEI NO']?.trim() || undefined;
        details.metadata = metadata;
        details.assetId = asset;
        await assetDetailsRepo.save(details);
      }
      
      successCount++;
      if (successCount % 500 === 0) {
        console.log(`Imported ${successCount}/${results.length} assets...`);
      }
    } catch (error) {
      console.error(`Error processing asset at row ${i + 1}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n--- Phase 3 Complete ---`);
  console.log(`Successfully Imported Assets: ${successCount}`);
  console.log(`Skipped/Errors: ${errorCount}`);
  
  await app.close();
  process.exit(0);
}

importAssetsFinal().catch(console.error);
