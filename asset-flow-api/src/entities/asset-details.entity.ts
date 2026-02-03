import { CommonEntity } from "./common.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Asset } from "./asset.entity";

@Entity({ name: 'asset_details' })
export class AssetDetails extends CommonEntity {
    @Column({ type: 'varchar', length: 255 })
    @Index()
    brand: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    model: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    ipAddress: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    computerName: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    operatingSystem: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    processor: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    memory: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    storage: string;

    @Column({ type: 'text' })
    remarks: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    poNumber: string;

    @Column({ type: 'date' })
    @Index()
    manufacturingDate: Date;

    @Column({ type: 'date', nullable: true })
    @Index()
    pmDate: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @Index()
    imei: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @OneToOne(() => Asset, (asset) => asset.assetDetails)
    @JoinColumn({ name: 'asset_id' })
    @Index()
    assetId: Asset;
}