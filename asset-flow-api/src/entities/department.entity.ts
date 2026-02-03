import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "./common.entity";
import { Division } from "./division.entity";
import { Unit } from "./unit.entity";

@Entity({ name: 'department' })
export class Department extends CommonEntity {
    @Column({ type: 'varchar', length: 255 })
    @Index()
    name: string;

    @ManyToOne(() => Division, (division) => division.id)
    @JoinColumn({ name: 'division_id' })
    @Index()
    divisionId: Division;

    @OneToMany(() => Unit, (unit) => unit.departmentId)
    units: Unit[];
}   