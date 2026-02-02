import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../../entities/user.entity';
import { CommonEntity } from '../../entities/common.entity';
import * as argon2 from 'argon2';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false
  }
});

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const adminEmail = 'admin@assetflow.com';
  const existingUser = await userRepository.findOneBy({ email: adminEmail });

  if (existingUser) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashedPassword = await argon2.hash('Admin123!');

  const user = new User();
  user.email = adminEmail;
  user.password = hashedPassword;
  user.name = 'Admin User';
  user.firstName = 'Admin';
  user.lastName = 'User';
  user.isActive = true;
  user.createdAt = new Date();
  user.updatedAt = new Date();

  await userRepository.save(user);

  console.log(`Admin user created: ${adminEmail} / Admin123!`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Error seeding admin user:', err);
  process.exit(1);
});
