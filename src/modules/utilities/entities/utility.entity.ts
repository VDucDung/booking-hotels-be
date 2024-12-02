import { TypeUtility } from 'src/modules/type_utility/entities/type_utility.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('utility')
export class Utility {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => TypeUtility, (typeUtility) => typeUtility.utilities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  typeUtility: TypeUtility;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
