import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';

@Entity('review')
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.reviews)
  @JoinColumn({ name: 'hotel_id' })
  hotelId: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;

  @Column({ type: 'text', array: true })
  images: string[];

  @Column({
    type: 'int',
    nullable: true,
  })
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted', default: false })
  deleted: boolean;
}
