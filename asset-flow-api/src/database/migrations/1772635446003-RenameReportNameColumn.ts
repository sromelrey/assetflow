import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameReportNameColumn1772635446003 implements MigrationInterface {
  name = 'RenameReportNameColumn1772635446003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename report_name column to reportName to match entity naming
    await queryRunner.query(
      `ALTER TABLE "report" RENAME COLUMN "report_name" TO "reportName"`,
    );
    // Rename error_message column to errorMessage to match entity naming
    await queryRunner.query(
      `ALTER TABLE "report" RENAME COLUMN "error_message" TO "errorMessage"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the change
    await queryRunner.query(
      `ALTER TABLE "report" RENAME COLUMN "reportName" TO "report_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "report" RENAME COLUMN "errorMessage" TO "error_message"`,
    );
  }
}
