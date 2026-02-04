import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../../entities/user.entity';

export const seeders = [
  {
    name: 'AdminUserSeeder',
    run: async (dataSource: DataSource) => {
      const userRepository = dataSource.getRepository(User);
      const adminEmail = 'admin@assetflow.com';
      const existingUser = await userRepository.findOneBy({ email: adminEmail });

      if (existingUser) {
        console.log('  Admin user already exists.');
        return;
      }

      const hashedPassword = await argon2.hash('Admin123!');
      const user = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      });

      await userRepository.save(user);
      console.log(`  Admin user created: ${adminEmail} / Admin123!`);
    },
  },
];
