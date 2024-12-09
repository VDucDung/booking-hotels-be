import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { ReviewReply } from 'src/modules/review_reply/entities/review_reply.entity';
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
  OneToMany,
} from 'typeorm';

@Entity('review')
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  userId: User;

  @ManyToOne(() => Hotel, (hotel) => hotel.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotelId: Hotel;

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'guest' })
  customerName: string;

  @Column({ type: 'varchar', length: 255 })
  comment: string;

  @Column({ type: 'text', array: true, nullable: true })
  images: string[];

  @Column({
    type: 'int',
    nullable: true,
  })
  rating: number;

  @OneToMany(() => ReviewReply, (reply) => reply.review, {
    onDelete: 'CASCADE',
  })
  replies: ReviewReply[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted', default: false })
  deleted: boolean;
}
