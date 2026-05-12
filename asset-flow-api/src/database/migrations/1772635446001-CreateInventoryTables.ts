import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryTables1772635446001 implements MigrationInterface {
  name = 'CreateInventoryTables1772635446001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create inventory table
    await queryRunner.query(`
      CREATE TABLE "inventory" (
        "id" SERIAL NOT NULL,
        "created_by" integer,
        "updated_by" integer,
        "deleted_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "sku" varchar NOT NULL,
        "name" varchar NOT NULL,
        "description" varchar,
        "quantity" integer NOT NULL DEFAULT 0,
        "unit_price" numeric,
        "min_stock_level" integer NOT NULL DEFAULT 0,
        "category_id" integer,
        "unit_id" integer,
        CONSTRAINT "PK_inventory" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_inventory_sku" UNIQUE ("sku")
      )
    `);

    // Create indexes for inventory
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_sku" ON "inventory" ("sku")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_category_id" ON "inventory" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_unit_id" ON "inventory" ("unit_id")`,
    );

    // Add foreign key constraints for inventory
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_inventory_category" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_inventory_unit" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Create inventory_log table
    await queryRunner.query(`
      CREATE TABLE "inventory_log" (
        "id" SERIAL NOT NULL,
        "created_by" integer,
        "updated_by" integer,
        "deleted_by" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "inventory_id" integer NOT NULL,
        "quantity_change" integer NOT NULL,
        "previous_quantity" integer NOT NULL,
        "new_quantity" integer NOT NULL,
        "reason" varchar NOT NULL,
        "reference_type" varchar,
        "reference_id" integer,
        "changed_by" integer,
        CONSTRAINT "PK_inventory_log" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for inventory_log
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_log_inventory_id" ON "inventory_log" ("inventory_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_log_changed_by" ON "inventory_log" ("changed_by")`,
    );

    // Add foreign key constraints for inventory_log
    await queryRunner.query(
      `ALTER TABLE "inventory_log" ADD CONSTRAINT "FK_inventory_log_inventory" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" ADD CONSTRAINT "FK_inventory_log_changed_by_user" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Add inventory_id column to asset table
    await queryRunner.query(
      `ALTER TABLE "asset" ADD COLUMN "inventory_id" integer`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_asset_inventory_id" ON "asset" ("inventory_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset" ADD CONSTRAINT "FK_asset_inventory" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key from asset table
    await queryRunner.query(
      `ALTER TABLE "asset" DROP CONSTRAINT "FK_asset_inventory"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_asset_inventory_id"`);
    await queryRunner.query(`ALTER TABLE "asset" DROP COLUMN "inventory_id"`);

    // Remove inventory_log table
    await queryRunner.query(
      `ALTER TABLE "inventory_log" DROP CONSTRAINT "FK_inventory_log_changed_by_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" DROP CONSTRAINT "FK_inventory_log_inventory"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_inventory_log_changed_by"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_inventory_log_inventory_id"`,
    );
    await queryRunner.query(`DROP TABLE "inventory_log"`);

    // Remove inventory table
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_inventory_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_inventory_category"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_inventory_unit_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_inventory_category_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_inventory_sku"`);
    await queryRunner.query(`DROP TABLE "inventory"`);
  }
}
