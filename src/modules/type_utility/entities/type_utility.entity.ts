import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { Utility } from 'src/modules/utilities/entities/utility.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('type_utility')
export class TypeUtility {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.typeUtility, { nullable: true })
  @JoinColumn({ name: 'hotel_id' })
  hotel?: Hotel;

  @OneToMany(() => Utility, (utility) => utility.typeUtility)
  utilities: Utility[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
