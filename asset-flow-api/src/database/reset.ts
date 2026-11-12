import 'tsconfig-paths/register';
import AppDataSource from '../typeorm.config';
import { seeders } from './seeds';

/**
 * Reset database: Truncate all tables and re-run seeders.
 * Usage: npm run db:reset
 *
 * WARNING: This will DELETE ALL DATA in the database!
 */
async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');
  console.log('⚠️  WARNING: This will DELETE ALL DATA!\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    const queryRunner = AppDataSource.createQueryRunner();

    // In this project, we mainly use the 'public' schema
    const schemas = ['public'];

    console.log(
      '🗑️  Truncating all tables in schemas:',
      schemas.join(', '),
      '...\n',
    );

    for (const schema of schemas) {
      const tables = await queryRunner.query(
        `
        SELECT tablename FROM pg_tables 
        WHERE schemaname = $1 AND tablename != 'migrations'
      `,
        [schema],
      );

      for (const table of tables) {
        const tableName = table.tablename;
        try {
          await queryRunner.query(
            `TRUNCATE TABLE "${schema}"."${tableName}" RESTART IDENTITY CASCADE`,
          );
          console.log(`  ✅ Truncated: ${schema}.${tableName}`);
        } catch (error) {
          console.log(
            `  ⚠️  Could not truncate ${schema}.${tableName}: ${(error as Error).message}`,
          );
        }
      }
    }

    await queryRunner.release();

    console.log('\n✅ All tables truncated!\n');

    // Re-run all seeders
    console.log('🌱 Re-running seeders...\n');

    for (const seeder of seeders) {
      console.log(`📦 Running: ${seeder.name}`);
      await seeder.run(AppDataSource);
      console.log(`✅ Completed: ${seeder.name}\n`);
    }

    console.log('🎉 Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

resetDatabase();
