import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAssetStatusLog1772200000000 implements MigrationInterface {
  name = 'CreateAssetStatusLog1772200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "asset_status_log" (
                "id" SERIAL NOT NULL,
                "created_by" integer,
                "updated_by" integer,
                "deleted_by" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "old_status" "public"."asset_status_enum" NOT NULL,
                "new_status" "public"."asset_status_enum" NOT NULL,
                "remarks" text,
                "asset_id" integer,
                CONSTRAINT "PK_asset_status_log" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "IDX_asset_status_log_asset_id" ON "asset_status_log" ("asset_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_status_log" ADD CONSTRAINT "FK_asset_status_log_asset" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset_status_log" DROP CONSTRAINT "FK_asset_status_log_asset"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_asset_status_log_asset_id"`,
    );
    await queryRunner.query(`DROP TABLE "asset_status_log"`);
  }
}
