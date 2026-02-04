import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssetDetails1770126464449 implements MigrationInterface {
    name = 'AddAssetDetails1770126464449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create Department table
        await queryRunner.query(`CREATE TABLE "department" ("id" SERIAL NOT NULL, "created_by" integer, "updated_by" integer, "deleted_by" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(255) NOT NULL, "division_id" integer, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e08733469befa8287ca4666e24" ON "department" ("created_by") `);
        await queryRunner.query(`CREATE INDEX "IDX_0dc397a4374b9ccd648cee43bb" ON "department" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_471da4b90e96c1ebe0af221e07" ON "department" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5bb168197facdc901e67b40c9" ON "department" ("division_id") `);

        // 2. Create AssetDetails table
        await queryRunner.query(`CREATE TABLE "asset_details" ("id" SERIAL NOT NULL, "created_by" integer, "updated_by" integer, "deleted_by" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "brand" character varying(255) NOT NULL, "model" character varying(255) NOT NULL, "ipAddress" character varying(255) NOT NULL, "computerName" character varying(255) NOT NULL, "operatingSystem" character varying(255) NOT NULL, "processor" character varying(255) NOT NULL, "memory" character varying(255) NOT NULL, "storage" character varying(255) NOT NULL, "remarks" text NOT NULL, "poNumber" character varying(255) NOT NULL, "manufacturingDate" date NOT NULL, "pmDate" date, "imei" character varying(100), "metadata" jsonb, "asset_id" integer, CONSTRAINT "REL_3170f994c78721d632f586b29d" UNIQUE ("asset_id"), CONSTRAINT "PK_42a781c6f581f3f1d0ef9285298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_309306fe0f490a1941f3d13516" ON "asset_details" ("created_by") `);
        await queryRunner.query(`CREATE INDEX "IDX_b0f4690f68c35401d908232008" ON "asset_details" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_2119182154e200654d09435de5" ON "asset_details" ("brand") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b97e2239637a01210f38bb526" ON "asset_details" ("model") `);
        await queryRunner.query(`CREATE INDEX "IDX_4f652933a4db384347b2ddfdf6" ON "asset_details" ("ipAddress") `);
        await queryRunner.query(`CREATE INDEX "IDX_161fe2b470b3ebcf726d78e7e8" ON "asset_details" ("computerName") `);
        await queryRunner.query(`CREATE INDEX "IDX_a37462f698cc7fe725de0becb2" ON "asset_details" ("operatingSystem") `);
        await queryRunner.query(`CREATE INDEX "IDX_fd80da473e20de575e1e6fe47c" ON "asset_details" ("processor") `);
        await queryRunner.query(`CREATE INDEX "IDX_f3ac3aab30ada4d6bf9a4c8621" ON "asset_details" ("memory") `);
        await queryRunner.query(`CREATE INDEX "IDX_139b134ff0d9ad7b26fd449470" ON "asset_details" ("storage") `);
        await queryRunner.query(`CREATE INDEX "IDX_c7b141b1dd395c6d75c6b47917" ON "asset_details" ("poNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_c9f8680efae0cf96ef1c596466" ON "asset_details" ("manufacturingDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_0e8a961a400458c95236740079" ON "asset_details" ("pmDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_ff475a5aac8b6a3a9ccffa072e" ON "asset_details" ("imei") `);
        await queryRunner.query(`CREATE INDEX "IDX_3170f994c78721d632f586b29d" ON "asset_details" ("asset_id") `);

        // 3. Alter Unit table (Drop foreign key to Division, Add foreign key to Department)
        // Check constraint name for unit->division in CreateEntities
        // From CreateEntities: FK_2dc46de93b2b55a089d5f1137e8
        await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT "FK_2dc46de93b2b55a089d5f1137e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2dc46de93b2b55a089d5f1137e"`); // Drop index on division_id
        await queryRunner.query(`ALTER TABLE "unit" DROP COLUMN "division_id"`);
        await queryRunner.query(`ALTER TABLE "unit" ADD "department_id" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_54b0962d7c79cb6ed7833dca81" ON "unit" ("department_id") `);

        // 4. Alter Asset table (Rename serialNumber to serialNo)
        // From CreateEntities: serialNumber column
        // Check constraints/indices on serialNumber
        // UQ_a3380df49dbb7469ceb2f606e4e (unique)
        // IDX_a3380df49dbb7469ceb2f606e4 (unique index)
        
        // We can just rename the column. TypeORM's renameColumn handles constraints usually, but plain SQL query might not.
        await queryRunner.query(`ALTER TABLE "asset" RENAME COLUMN "serialNumber" TO "serialNo"`);
        
        // Note: Renaming column preserves constraints in Postgres usually, but the index name might remain old.
        // It's cleaner to drop and recreate constraint if we want new names, but for now renaming is sufficient functionality.
        
        // Add Foreign Keys
        await queryRunner.query(`ALTER TABLE "department" ADD CONSTRAINT "FK_c5bb168197facdc901e67b40c91" FOREIGN KEY ("division_id") REFERENCES "division"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "FK_54b0962d7c79cb6ed7833dca81f" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset_details" ADD CONSTRAINT "FK_3170f994c78721d632f586b29db" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert 4. Asset serialNo -> serialNumber
        await queryRunner.query(`ALTER TABLE "asset" RENAME COLUMN "serialNo" TO "serialNumber"`);

        // Revert 3. Unit department -> division
        await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT "FK_54b0962d7c79cb6ed7833dca81f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54b0962d7c79cb6ed7833dca81"`);
        await queryRunner.query(`ALTER TABLE "unit" DROP COLUMN "department_id"`);
        await queryRunner.query(`ALTER TABLE "unit" ADD "division_id" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_2dc46de93b2b55a089d5f1137e" ON "unit" ("division_id") `);
        await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "FK_2dc46de93b2b55a089d5f1137e8" FOREIGN KEY ("division_id") REFERENCES "division"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Revert Department FK
        await queryRunner.query(`ALTER TABLE "department" DROP CONSTRAINT "FK_c5bb168197facdc901e67b40c91"`);

        // Revert AssetDetails
        await queryRunner.query(`ALTER TABLE "asset_details" DROP CONSTRAINT "FK_3170f994c78721d632f586b29db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3170f994c78721d632f586b29d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff475a5aac8b6a3a9ccffa072e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e8a961a400458c95236740079"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9f8680efae0cf96ef1c596466"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7b141b1dd395c6d75c6b47917"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_139b134ff0d9ad7b26fd449470"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3ac3aab30ada4d6bf9a4c8621"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd80da473e20de575e1e6fe47c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a37462f698cc7fe725de0becb2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_161fe2b470b3ebcf726d78e7e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4f652933a4db384347b2ddfdf6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b97e2239637a01210f38bb526"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2119182154e200654d09435de5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b0f4690f68c35401d908232008"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_309306fe0f490a1941f3d13516"`);
        await queryRunner.query(`DROP TABLE "asset_details"`);

        // Revert Department
        await queryRunner.query(`DROP INDEX "public"."IDX_c5bb168197facdc901e67b40c9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_471da4b90e96c1ebe0af221e07"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dc397a4374b9ccd648cee43bb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e08733469befa8287ca4666e24"`);
        await queryRunner.query(`DROP TABLE "department"`);
    }
}
