import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { CommonEntity } from './entities/common.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, CommonEntity],
  migrations: ['src/database/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false
  },
});
