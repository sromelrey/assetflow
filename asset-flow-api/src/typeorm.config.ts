import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { CommonEntity } from './entities/common.entity';
import { Asset } from './entities/asset.entity';
import { Building } from './entities/building.entity';
import { Category } from './entities/category.entity';
import { Division } from './entities/division.entity';
import { Employee } from './entities/employee.entity';
import { Floor } from './entities/floor.entity';
import { Site } from './entities/site.entity';
import { Unit } from './entities/unit.entity';

import { AssetDetails } from './entities/asset-details.entity';
import { Department } from './entities/department.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    CommonEntity,
    Asset,
    AssetDetails,
    Building,
    Category,
    Department,
    Building,
    Category,
    Division,
    Employee,
    Floor,
    Site,
    Unit,
  ],
  migrations: ['src/database/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false
  },
});
