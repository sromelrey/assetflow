import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameErrorMessageColumn1772635446004 implements MigrationInterface {
  name = 'RenameErrorMessageColumn1772635446004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename error_message column to errorMessage to match entity naming
    await queryRunner.query(
      `ALTER TABLE "report" RENAME COLUMN "error_message" TO "errorMessage"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the change
    await queryRunner.query(
      `ALTER TABLE "report" RENAME COLUMN "errorMessage" TO "error_message"`,
    );
  }
}
