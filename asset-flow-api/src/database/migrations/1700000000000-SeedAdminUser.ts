import { MigrationInterface, QueryRunner } from "typeorm";
import * as argon2 from 'argon2';

export class SeedAdminUser1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const password = await argon2.hash('Admin123!');
        const adminEmail = 'admin@assetflow.com';
        const existingUsers = await queryRunner.query(
            `SELECT id FROM "users" WHERE "email" = $1`,
            [adminEmail]
        );

        if (existingUsers.length === 0) {
            await queryRunner.query(
                `INSERT INTO "users" ("email", "password", "name", "first_name", "last_name", "is_active", "created_at", "updated_at") 
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [adminEmail, password, 'Admin User', 'Admin', 'User', true]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "users" WHERE "email" = $1`,
            ['admin@assetflow.com']
        );
    }
}
