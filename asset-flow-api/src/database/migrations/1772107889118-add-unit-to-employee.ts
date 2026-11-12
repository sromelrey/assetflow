import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUnitToEmployee1772107889118 implements MigrationInterface {
  name = 'AddUnitToEmployee1772107889118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "employee" ADD "unit_id" integer`);
    await queryRunner.query(
      `CREATE INDEX "IDX_2ec48bd014dcbea7d0fdcbf29d" ON "employee" ("unit_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_2ec48bd014dcbea7d0fdcbf29df" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_2ec48bd014dcbea7d0fdcbf29df"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ec48bd014dcbea7d0fdcbf29d"`,
    );
    await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "unit_id"`);
  }
}
