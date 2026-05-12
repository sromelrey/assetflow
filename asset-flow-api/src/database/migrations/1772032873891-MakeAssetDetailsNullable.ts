import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAssetDetailsNullable1772032873891 implements MigrationInterface {
  name = 'MakeAssetDetailsNullable1772032873891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_866278f3c1b87d8202d7698610"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3380df49dbb7469ceb2f606e4"`,
    );
    await queryRunner.query(`ALTER TABLE "unit" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "brand" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "model" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "ipAddress" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "computerName" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "operatingSystem" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "processor" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "memory" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "storage" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "remarks" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "poNumber" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "manufacturingDate" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset" ALTER COLUMN "assetNo" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_34f2800f6efed3cec06e22af11" ON "asset" ("serialNo") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_34f2800f6efed3cec06e22af11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset" ALTER COLUMN "assetNo" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "manufacturingDate" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "poNumber" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "remarks" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "storage" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "memory" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "processor" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "operatingSystem" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "computerName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "ipAddress" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "model" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_details" ALTER COLUMN "brand" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "unit" ADD "status" character varying(50) NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a3380df49dbb7469ceb2f606e4" ON "asset" ("serialNo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_866278f3c1b87d8202d7698610" ON "unit" ("status") `,
    );
  }
}
