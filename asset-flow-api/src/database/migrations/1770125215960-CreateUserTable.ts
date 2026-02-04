import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1770125215960 implements MigrationInterface {
    name = 'CreateUserTable1770125215960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" (
            "id" SERIAL NOT NULL, 
            "created_by" integer, 
            "updated_by" integer, 
            "deleted_by" integer, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP DEFAULT now(), 
            "deleted_at" TIMESTAMP, 
            "name" character varying(150) NOT NULL, 
            "email" character varying(255) NOT NULL, 
            "password" character varying(255) NOT NULL, 
            "first_name" character varying(100), 
            "last_name" character varying(100), 
            "is_active" boolean NOT NULL DEFAULT true, 
            "refresh_token" character varying(500), 
            CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
            CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_created_by" ON "users" ("created_by") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_created_at" ON "users" ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_user_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_created_by"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
