import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportTable1772635446002 implements MigrationInterface {
  name = 'CreateReportTable1772635446002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create report table
    await queryRunner.query(`
      CREATE TABLE "report" (
        "id" SERIAL NOT NULL,
        "created_by" integer,
        "updated_by" integer,
        "deleted_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "report_name" varchar NOT NULL,
        "report_type" varchar NOT NULL,
        "generated_by" integer,
        "filters_json" jsonb,
        "report_data_json" jsonb,
        "export_file_paths" jsonb,
        "status" varchar NOT NULL DEFAULT 'GENERATING',
        "error_message" varchar,
        CONSTRAINT "PK_report" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for report
    await queryRunner.query(
      `CREATE INDEX "IDX_report_report_name" ON "report" ("report_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_report_report_type" ON "report" ("report_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_report_generated_by" ON "report" ("generated_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_report_status" ON "report" ("status")`,
    );

    // Add foreign key constraint for generated_by
    await queryRunner.query(
      `ALTER TABLE "report" ADD CONSTRAINT "FK_report_generated_by_user" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "report" DROP CONSTRAINT "FK_report_generated_by_user"`,
    );

    // Remove indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_report_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_report_generated_by"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_report_report_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_report_report_name"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "report"`);
  }
}
