import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChangedByToStatusLog1772635446000 implements MigrationInterface {
    name = 'AddChangedByToStatusLog1772635446000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_status_log" ADD "changed_by" integer`);
        await queryRunner.query(`ALTER TABLE "asset_status_log" ADD CONSTRAINT "FK_asset_status_log_user" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_status_log" DROP CONSTRAINT "FK_asset_status_log_user"`);
        await queryRunner.query(`ALTER TABLE "asset_status_log" DROP COLUMN "changed_by"`);
    }
}
